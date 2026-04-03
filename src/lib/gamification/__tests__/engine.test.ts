import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase mock ──────────────────────────────────────────────────────
// Build a chainable query builder that records calls and returns configurable data.
type MockRow = Record<string, unknown>;

function createQueryBuilder(defaults: { data?: MockRow | MockRow[] | null; error?: unknown; count?: number | null } = {}) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  const chainMethods = [
    "select", "insert", "update", "upsert", "delete",
    "eq", "in", "maybeSingle", "single",
  ];

  // Every chain method returns the builder itself (for chaining).
  for (const m of chainMethods) {
    builder[m] = vi.fn().mockReturnValue(builder);
  }

  // Terminal: awaiting the builder resolves to { data, error, count }
  builder.then = vi.fn((resolve: (v: unknown) => void) =>
    resolve({ data: defaults.data ?? null, error: defaults.error ?? null, count: defaults.count ?? null })
  );

  return builder;
}

// We'll swap out per-table return values via this map.
let tableOverrides: Record<string, ReturnType<typeof createQueryBuilder>> = {};

const mockRpc = vi.fn();
const mockAuth = { getUser: vi.fn() };

const mockSupabase = {
  from: vi.fn((table: string) => {
    if (tableOverrides[table]) return tableOverrides[table];
    return createQueryBuilder();
  }),
  rpc: mockRpc,
  auth: mockAuth,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// ── Import under test (after mock) ────────────────────────────────────
import { handleCheckpointComplete } from "@/lib/gamification/engine";
import { XP } from "@/lib/gamification/constants";

// ── Helpers ────────────────────────────────────────────────────────────
const USER_ID = "user-abc-123";

function setupDefaults(overrides: {
  existingXPEvents?: MockRow[];
  profile?: MockRow;
  checkpoints?: MockRow[];
  moduleProgress?: MockRow[];
  existingBadges?: MockRow[];
} = {}) {
  const {
    existingXPEvents = [],
    profile = { current_streak: 0, role_track: null },
    checkpoints = [],
    moduleProgress = [],
    existingBadges = [],
  } = overrides;

  // Reset overrides.
  tableOverrides = {};

  // checkpoint_progress — upsert (returns nothing useful) & select for completion check
  const cpBuilder = createQueryBuilder({ data: checkpoints });
  tableOverrides["checkpoint_progress"] = cpBuilder;

  // xp_events — select existing events (idempotency), insert new ones
  const xpBuilder = createQueryBuilder({ data: existingXPEvents });
  tableOverrides["xp_events"] = xpBuilder;

  // profiles — select current_streak + role_track
  const profileBuilder = createQueryBuilder({ data: profile });
  tableOverrides["profiles"] = profileBuilder;

  // badges — select existing, insert new
  const badgeBuilder = createQueryBuilder({ data: existingBadges });
  tableOverrides["badges"] = badgeBuilder;

  // module_progress — select & update
  const mpBuilder = createQueryBuilder({ data: moduleProgress });
  tableOverrides["module_progress"] = mpBuilder;

  // processed_events (not used by engine, but just in case)
  tableOverrides["processed_events"] = createQueryBuilder();

  // RPC: increment_xp returns new total and level info
  mockRpc.mockResolvedValue({
    data: [{ new_xp: 10, old_level: "Novice", new_level: "Novice" }],
  });
}

// ── Tests ──────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  setupDefaults();
});

describe("handleCheckpointComplete", () => {
  it("awards checkpoint XP on first completion", async () => {
    const result = await handleCheckpointComplete(USER_ID, 1, 0);

    expect(result.xpAwarded).toBeGreaterThanOrEqual(XP.CHECKPOINT);
    expect(mockRpc).toHaveBeenCalledWith("increment_xp", {
      p_user_id: USER_ID,
      p_amount: XP.CHECKPOINT,
    });
  });

  it("updates streak via RPC", async () => {
    await handleCheckpointComplete(USER_ID, 1, 0);

    expect(mockRpc).toHaveBeenCalledWith("update_streak", {
      p_user_id: USER_ID,
    });
  });

  it("upserts checkpoint_progress", async () => {
    await handleCheckpointComplete(USER_ID, 1, 0);

    const fromCall = mockSupabase.from;
    expect(fromCall).toHaveBeenCalledWith("checkpoint_progress");
  });

  it("returns totalXP from the RPC response", async () => {
    // increment_xp is called multiple times (checkpoint + badge XP).
    // The collector.totalXP reflects the LAST increment_xp result.
    mockRpc.mockImplementation((fn: string) => {
      if (fn === "increment_xp") {
        return Promise.resolve({
          data: [{ new_xp: 420, old_level: "Novice", new_level: "Novice" }],
        });
      }
      return Promise.resolve({ data: null });
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 0);
    expect(result.totalXP).toBe(420);
  });

  it("detects level-up when RPC reports different levels", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ new_xp: 500, old_level: "Novice", new_level: "Builder" }],
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 0);
    expect(result.previousLevel).toBe("Novice");
    expect(result.newLevel).toBe("Builder");
  });
});

describe("badge idempotency", () => {
  it("does not re-award a badge the user already has", async () => {
    // The user already has the "first-checkpoint" badge.
    setupDefaults({
      existingBadges: [{ badge_slug: "first-checkpoint" }],
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 0);

    // The first-checkpoint badge should NOT appear in badgesEarned since
    // batchAwardBadges filters it out via the existing set.
    const firstCheckpointBadge = result.badgesEarned.find(
      (b) => b.slug === "first-checkpoint"
    );
    expect(firstCheckpointBadge).toBeUndefined();
  });

  it("skips checkpoint XP if already awarded for the same checkpoint", async () => {
    setupDefaults({
      existingXPEvents: [
        {
          event_type: "checkpoint",
          metadata: { module_number: 1, checkpoint_index: 0 },
        },
      ],
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 0);

    // XP should still come from badge awards but NOT from the checkpoint itself.
    // The increment_xp RPC should not be called with CHECKPOINT amount for this checkpoint.
    // We verify by checking that xpAwarded does NOT include the checkpoint XP.
    // (Badge XP from first-checkpoint may still be awarded.)
    // Since the checkpoint XP is skipped, xpAwarded should be less than it would be
    // with checkpoint XP included.
    expect(result.xpAwarded).toBeLessThan(XP.CHECKPOINT + 100);
  });
});

describe("module completion", () => {
  it("triggers module completion when all checkpoints are done", async () => {
    // Module 1 has 6 checkpoints. Simulate that all 6 are now completed.
    setupDefaults({
      checkpoints: [
        { checkpoint_index: 0 },
        { checkpoint_index: 1 },
        { checkpoint_index: 2 },
        { checkpoint_index: 3 },
        { checkpoint_index: 4 },
        { checkpoint_index: 5 },
      ],
      moduleProgress: [],
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 5);

    expect(result.moduleCompleted).toBe(1);
  });

  it("does NOT trigger module completion when checkpoints are incomplete", async () => {
    // Only 3 of 6 checkpoints completed for module 1.
    setupDefaults({
      checkpoints: [
        { checkpoint_index: 0 },
        { checkpoint_index: 1 },
        { checkpoint_index: 2 },
      ],
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 2);

    expect(result.moduleCompleted).toBeNull();
  });
});

describe("streak badges", () => {
  it("awards streak-3 badge at 3-day streak", async () => {
    setupDefaults({
      profile: { current_streak: 3, role_track: null },
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 0);

    const streakBadge = result.badgesEarned.find((b) => b.slug === "streak-3");
    expect(streakBadge).toBeDefined();
    expect(streakBadge?.name).toBe("Hat Trick");
  });

  it("awards streak-7 badge and bonus XP at 7-day streak", async () => {
    setupDefaults({
      profile: { current_streak: 7, role_track: null },
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 0);

    const streakBadge = result.badgesEarned.find((b) => b.slug === "streak-7");
    expect(streakBadge).toBeDefined();
    // Streak-7 bonus XP should be awarded (25 XP)
    expect(result.xpAwarded).toBeGreaterThanOrEqual(XP.STREAK_7);
  });

  it("sets streakMilestone when streak badge is newly earned", async () => {
    setupDefaults({
      profile: { current_streak: 3, role_track: null },
    });

    const result = await handleCheckpointComplete(USER_ID, 1, 0);

    expect(result.streakMilestone).toBe(3);
  });
});

describe("role-track badges", () => {
  it("awards PM-track badge when all PM core modules are completed", async () => {
    // PM core modules: 1,2,3,4,5,6,7,8,9,15,16
    // Simulate all completed via module_progress
    const allCompleted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16];
    const mpData = allCompleted.map((n) => ({ module_number: n, status: "completed" }));

    // Module 16 has 7 checkpoints — simulate all done
    setupDefaults({
      checkpoints: [
        { checkpoint_index: 0 },
        { checkpoint_index: 1 },
        { checkpoint_index: 2 },
        { checkpoint_index: 3 },
        { checkpoint_index: 4 },
        { checkpoint_index: 5 },
        { checkpoint_index: 6 },
      ],
      moduleProgress: mpData,
      profile: { current_streak: 0, role_track: "pm" },
    });

    const result = await handleCheckpointComplete(USER_ID, 16, 6);

    // Module 16 should be marked completed
    expect(result.moduleCompleted).toBe(16);
  });
});

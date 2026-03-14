import type { BadgeDefinition, LevelDefinition } from "@/types";

// XP Values
export const XP = {
  CHECKPOINT: 10,
  MODULE_COMPLETE: 50,
  TIER_COMPLETE: 100,
  CAPSTONE: 200,
  DAILY_STREAK: 5,
  STREAK_7: 25,
  STREAK_30: 100,
  REFERRAL_BONUS: 100,
} as const;

// Levels
export const LEVELS: LevelDefinition[] = [
  { level: 1, title: "Novice", xpRequired: 0 },
  { level: 2, title: "Builder", xpRequired: 500 },
  { level: 3, title: "Shipper", xpRequired: 1200 },
  { level: 4, title: "Master", xpRequired: 2000 },
];

export function getLevelForXP(xp: number): LevelDefinition {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): {
  current: LevelDefinition;
  next: LevelDefinition | null;
  progressPercent: number;
} {
  const current = getLevelForXP(xp);
  const nextIdx = LEVELS.findIndex((l) => l.level === current.level) + 1;
  const next = nextIdx < LEVELS.length ? LEVELS[nextIdx] : null;

  if (!next) return { current, next: null, progressPercent: 100 };

  const progressPercent = Math.round(
    ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100
  );
  return { current, next, progressPercent };
}

// Badge Definitions
export const BADGES: BadgeDefinition[] = [
  // Milestone
  {
    slug: "first-checkpoint",
    name: "First Step",
    description: "Complete your first checkpoint",
    icon: "🎯",
    category: "milestone",
  },
  {
    slug: "foundations-complete",
    name: "Foundations Built",
    description: "Complete all Tier 1 modules",
    icon: "🏗️",
    category: "milestone",
  },
  {
    slug: "intermediate-explorer",
    name: "Intermediate Explorer",
    description: "Complete 3+ Tier 2 modules",
    icon: "🧭",
    category: "milestone",
  },
  {
    slug: "advanced-achiever",
    name: "Advanced Achiever",
    description: "Complete 2+ Tier 3 modules",
    icon: "⭐",
    category: "milestone",
  },
  {
    slug: "capstone-shipped",
    name: "Capstone Shipped",
    description: "Complete the capstone project",
    icon: "🚀",
    category: "milestone",
  },
  {
    slug: "completionist",
    name: "Completionist",
    description: "Complete all 16 modules",
    icon: "👑",
    category: "milestone",
  },
  // Streak
  {
    slug: "streak-3",
    name: "Hat Trick",
    description: "3-day learning streak",
    icon: "🔥",
    category: "streak",
  },
  {
    slug: "streak-7",
    name: "Week Warrior",
    description: "7-day learning streak",
    icon: "💪",
    category: "streak",
  },
  {
    slug: "streak-30",
    name: "Monthly Master",
    description: "30-day learning streak",
    icon: "🏆",
    category: "streak",
  },
  // Role
  {
    slug: "pm-track",
    name: "PM Path",
    description: "Complete all PM core modules",
    icon: "📋",
    category: "role",
  },
  {
    slug: "pjm-track",
    name: "PjM Path",
    description: "Complete all Project Manager core modules",
    icon: "📊",
    category: "role",
  },
  {
    slug: "ba-track",
    name: "BA Path",
    description: "Complete all Business Analyst core modules",
    icon: "📈",
    category: "role",
  },
  {
    slug: "bi-track",
    name: "BI Path",
    description: "Complete all BI Engineer core modules",
    icon: "🔬",
    category: "role",
  },
  {
    slug: "role-capstone",
    name: "Role Capstone",
    description: "Complete a role-specific capstone project",
    icon: "🎓",
    category: "role",
  },
  // Special
  {
    slug: "night-owl",
    name: "Night Owl",
    description: "Complete a checkpoint after 10pm",
    icon: "🦉",
    category: "special",
  },
  {
    slug: "speed-runner",
    name: "Speed Runner",
    description: "Complete a module within 24 hours",
    icon: "⚡",
    category: "special",
  },
  {
    slug: "early-bird",
    name: "Early Bird",
    description: "Complete a checkpoint before 7am",
    icon: "🐦",
    category: "special",
  },
  {
    slug: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Complete a checkpoint on Saturday or Sunday",
    icon: "🗓️",
    category: "special",
  },
  {
    slug: "referral-champion",
    name: "Referral Champion",
    description: "Referred 3 friends who completed Module 1",
    icon: "🤝",
    category: "special",
  },
];

export function getBadgeBySlug(slug: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.slug === slug);
}

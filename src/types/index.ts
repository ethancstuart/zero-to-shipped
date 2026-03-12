export type RoleTrack = "pm" | "pjm" | "ba" | "bi";
export type ToolPreference = "claude-code" | "cursor";
export type ModuleStatus = "locked" | "available" | "in_progress" | "completed";
export type XPEventType =
  | "checkpoint"
  | "module_complete"
  | "tier_complete"
  | "capstone"
  | "streak_bonus"
  | "badge_earned";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role_track: RoleTrack | null;
  tool_preference: ToolPreference;
  xp: number;
  level: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  public_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_number: number;
  status: ModuleStatus;
  started_at: string | null;
  completed_at: string | null;
}

export interface CheckpointProgress {
  id: string;
  user_id: string;
  module_number: number;
  checkpoint_index: number;
  completed: boolean;
  completed_at: string | null;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_slug: string;
  earned_at: string;
}

export interface XPEvent {
  id: string;
  user_id: string;
  event_type: XPEventType;
  xp_amount: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ModuleTier = "foundations" | "intermediate" | "advanced" | "capstone";

export interface ModuleMeta {
  number: number;
  slug: string;
  title: string;
  tier: ModuleTier;
  estimatedHours: string;
  description: string;
  prerequisites: number[];
  checkpoints: string[];
  roleRelevance: Record<RoleTrack, "core" | "recommended" | "optional">;
}

export interface ParsedModule extends ModuleMeta {
  contentHtml: string;
}

export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "streak" | "role" | "special";
}

export interface LevelDefinition {
  level: number;
  title: string;
  xpRequired: number;
}

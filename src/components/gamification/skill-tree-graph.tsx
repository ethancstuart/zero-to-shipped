"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleStatus } from "@/types";

// Node positions on the SVG canvas (hand-tuned layout)
const NODE_POSITIONS: Record<number, { x: number; y: number }> = {
  // Tier 1: Foundations
  1: { x: 400, y: 60 },
  2: { x: 250, y: 160 },
  3: { x: 400, y: 160 },
  4: { x: 550, y: 160 },
  5: { x: 400, y: 260 },
  // Tier 2: Intermediate
  6: { x: 300, y: 370 },
  7: { x: 150, y: 370 },
  8: { x: 300, y: 470 },
  9: { x: 500, y: 370 },
  10: { x: 500, y: 470 },
  // Tier 3: Advanced
  11: { x: 200, y: 580 },
  12: { x: 400, y: 580 },
  13: { x: 600, y: 580 },
  14: { x: 300, y: 680 },
  15: { x: 500, y: 680 },
  // Capstone
  16: { x: 400, y: 790 },
};

const NODE_RADIUS = 28;

interface TreeModule {
  number: number;
  slug: string;
  title: string;
  prerequisites: number[];
}

interface SkillTreeGraphProps {
  modules: TreeModule[];
  statusMap: Record<number, ModuleStatus>;
}

const TIER_ORDER = ["foundations", "intermediate", "advanced", "capstone"] as const;
const TIER_LABELS: Record<string, string> = {
  foundations: "Foundations",
  intermediate: "Intermediate",
  advanced: "Advanced",
  capstone: "Capstone",
};

// Map module numbers to tiers based on the known layout
function getModuleTier(num: number): string {
  if (num <= 5) return "foundations";
  if (num <= 10) return "intermediate";
  if (num <= 15) return "advanced";
  return "capstone";
}

function StatusIcon({ status }: { status: ModuleStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-5 shrink-0 text-green-500" />;
    case "in_progress":
      return (
        <div className="size-5 shrink-0 rounded-full border-2 border-primary bg-primary/20" />
      );
    case "available":
      return <ChevronRight className="size-5 shrink-0 text-primary" />;
    default:
      return <Lock className="size-4 shrink-0 text-muted-foreground/40" />;
  }
}

function MobileSkillTreeList({ modules, statusMap }: SkillTreeGraphProps) {
  const getStatus = (num: number): ModuleStatus =>
    statusMap[num] ?? "locked";

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    modules: modules.filter((m) => getModuleTier(m.number) === tier),
  }));

  return (
    <div className="space-y-6">
      {grouped.map(({ tier, label, modules: tierModules }) => (
        <div key={tier}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
            {label}
          </h3>
          <div className="space-y-2">
            {tierModules.map((mod) => {
              const status = getStatus(mod.number);
              const isClickable = status !== "locked";

              const content = (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                    status === "completed" && "border-green-500/20 bg-green-500/5",
                    status === "in_progress" && "border-primary/30 bg-primary/5",
                    status === "available" && "border-border hover:border-primary/40 hover:bg-muted/50",
                    status === "locked" && "border-border/50 bg-muted/30 opacity-60"
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {mod.number}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm font-medium",
                      status === "locked" ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {mod.title}
                  </span>
                  <StatusIcon status={status} />
                </div>
              );

              if (isClickable) {
                return (
                  <Link key={mod.number} href={`/modules/${mod.slug}`}>
                    {content}
                  </Link>
                );
              }
              return <div key={mod.number}>{content}</div>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkillTreeGraph({ modules, statusMap }: SkillTreeGraphProps) {
  const getStatus = (num: number): ModuleStatus =>
    statusMap[num] ?? "locked";

  const getNodeColors = (status: ModuleStatus) => {
    switch (status) {
      case "completed":
        return { fill: "#22c55e", stroke: "#16a34a", text: "#fff" };
      case "in_progress":
        return { fill: "#3b82f6", stroke: "#2563eb", text: "#fff" };
      case "available":
        return { fill: "transparent", stroke: "#3b82f6", text: "#3b82f6" };
      default:
        return { fill: "#262626", stroke: "#404040", text: "#737373" };
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getEdgeColor = (from: number, _to: number) => {
    const fromStatus = getStatus(from);
    if (fromStatus === "completed") return "#22c55e";
    if (fromStatus === "in_progress") return "#3b82f6";
    return "#404040";
  };

  // Build edges from prerequisites
  const edges: { from: number; to: number }[] = [];
  for (const mod of modules) {
    for (const prereq of mod.prerequisites) {
      edges.push({ from: prereq, to: mod.number });
    }
  }

  return (
    <>
    {/* Mobile: list view */}
    <div className="block lg:hidden">
      <MobileSkillTreeList modules={modules} statusMap={statusMap} />
    </div>

    {/* Desktop: SVG graph */}
    <Card className="hidden overflow-x-auto lg:block">
      <CardContent>
      <svg viewBox="0 0 800 860" className="mx-auto w-full max-w-3xl">
        {/* Tier labels */}
        <text x="20" y="60" className="fill-primary text-[11px] font-semibold">
          FOUNDATIONS
        </text>
        <text x="20" y="370" className="fill-primary text-[11px] font-semibold">
          INTERMEDIATE
        </text>
        <text x="20" y="580" className="fill-primary text-[11px] font-semibold">
          ADVANCED
        </text>
        <text x="20" y="790" className="fill-primary text-[11px] font-semibold">
          CAPSTONE
        </text>

        {/* Edges */}
        {edges.map(({ from, to }) => {
          const fromPos = NODE_POSITIONS[from];
          const toPos = NODE_POSITIONS[to];
          if (!fromPos || !toPos) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={fromPos.x}
              y1={fromPos.y + NODE_RADIUS}
              x2={toPos.x}
              y2={toPos.y - NODE_RADIUS}
              stroke={getEdgeColor(from, to)}
              strokeWidth={2}
              strokeDasharray={getStatus(from) === "completed" ? "none" : "4 4"}
              opacity={0.6}
            />
          );
        })}

        {/* Nodes */}
        {modules.map((mod) => {
          const pos = NODE_POSITIONS[mod.number];
          if (!pos) return null;
          const status = getStatus(mod.number);
          const colors = getNodeColors(status);
          const isClickable = status !== "locked";

          const node = (
            <motion.g
              key={mod.number}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: mod.number * 0.05, type: "spring" }}
              className={isClickable ? "cursor-pointer" : ""}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                className="text-xs font-bold"
              >
                {mod.number}
              </text>
              <text
                x={pos.x}
                y={pos.y + NODE_RADIUS + 14}
                textAnchor="middle"
                fill={status === "locked" ? "#737373" : "#a3a3a3"}
                className="text-[9px]"
              >
                {mod.title.length > 20
                  ? mod.title.slice(0, 18) + "..."
                  : mod.title}
              </text>
            </motion.g>
          );

          if (isClickable) {
            return (
              <Link key={mod.number} href={`/modules/${mod.slug}`}>
                {node}
              </Link>
            );
          }
          return node;
        })}
      </svg>
      </CardContent>
    </Card>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MODULE_METADATA } from "@/lib/content/modules";
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

interface SkillTreeGraphProps {
  statusMap: Record<number, ModuleStatus>;
}

export function SkillTreeGraph({ statusMap }: SkillTreeGraphProps) {
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

  const getEdgeColor = (from: number, to: number) => {
    const fromStatus = getStatus(from);
    if (fromStatus === "completed") return "#22c55e";
    if (fromStatus === "in_progress") return "#3b82f6";
    return "#404040";
  };

  // Build edges from prerequisites
  const edges: { from: number; to: number }[] = [];
  for (const mod of MODULE_METADATA) {
    for (const prereq of mod.prerequisites) {
      edges.push({ from: prereq, to: mod.number });
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
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
        {MODULE_METADATA.map((mod) => {
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
    </div>
  );
}

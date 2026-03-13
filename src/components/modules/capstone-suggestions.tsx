import { Lightbulb } from "lucide-react";
import type { RoleTrack } from "@/types";

const CAPSTONE_IDEAS: Record<RoleTrack, { title: string; description: string }[]> = {
  pm: [
    {
      title: "Feature Request Tracker",
      description: "A web app where users submit feature requests, vote, and see a public roadmap.",
    },
    {
      title: "Competitive Analysis Dashboard",
      description: "Interactive tool that compares features across competitors with scoring.",
    },
    {
      title: "Sprint Planning Assistant",
      description: "AI-powered tool that helps break epics into stories with estimates.",
    },
  ],
  pjm: [
    {
      title: "Project Status Dashboard",
      description: "Real-time dashboard showing project health, risks, and milestone tracking.",
    },
    {
      title: "Resource Allocation Planner",
      description: "Visual tool for managing team capacity across multiple projects.",
    },
    {
      title: "Meeting Notes Summarizer",
      description: "Upload meeting notes and get AI-extracted action items and decisions.",
    },
  ],
  ba: [
    {
      title: "Requirements Document Generator",
      description: "AI-assisted tool that turns user stories into structured requirements docs.",
    },
    {
      title: "Process Flow Builder",
      description: "Drag-and-drop tool for creating and sharing business process diagrams.",
    },
    {
      title: "Data Dictionary Explorer",
      description: "Searchable catalog of data definitions with lineage and ownership tracking.",
    },
  ],
  bi: [
    {
      title: "Self-Service Query Builder",
      description: "Natural language to SQL tool that lets non-technical users query databases.",
    },
    {
      title: "Automated Report Suite",
      description: "Scheduled report generator with email delivery and trend analysis.",
    },
    {
      title: "Data Quality Monitor",
      description: "Dashboard tracking data freshness, completeness, and anomaly detection.",
    },
  ],
};

interface CapstoneSuggestionsProps {
  roleTrack: RoleTrack | null;
}

export function CapstoneSuggestions({ roleTrack }: CapstoneSuggestionsProps) {
  const ideas = roleTrack ? CAPSTONE_IDEAS[roleTrack] : CAPSTONE_IDEAS.pm;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="size-5 text-primary" />
        <h3 className="font-semibold">Capstone Project Ideas</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Not sure what to build? Here are some ideas tailored to your role:
      </p>
      <div className="space-y-3">
        {ideas.map((idea) => (
          <div key={idea.title} className="rounded-lg border border-border bg-card p-4">
            <h4 className="font-medium">{idea.title}</h4>
            <p className="text-sm text-muted-foreground">{idea.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

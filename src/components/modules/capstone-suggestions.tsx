import { Lightbulb, FileText } from "lucide-react";
import type { RoleTrack } from "@/types";

interface CapstoneIdea {
  title: string;
  description: string;
}

interface CapstoneTemplate {
  title: string;
  brief: string;
  requirements: string[];
  architecture: string[];
  rubric: string[];
}

const CAPSTONE_IDEAS: Record<RoleTrack, CapstoneIdea[]> = {
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

const CAPSTONE_TEMPLATES: Record<RoleTrack, CapstoneTemplate> = {
  pm: {
    title: "Product Manager Capstone Template",
    brief: "Build a product tool that demonstrates your ability to define requirements, prioritize features, and ship an MVP. The project should solve a real pain point in product management workflows.",
    requirements: [
      "User authentication with role-based access",
      "CRUD operations for the core domain entity",
      "Dashboard with key metrics or status overview",
      "At least one integration (API, email, or webhook)",
      "Responsive design that works on mobile",
    ],
    architecture: [
      "Next.js app with server components for data fetching",
      "Supabase for auth, database, and real-time subscriptions",
      "API routes for integrations and background processing",
      "Tailwind CSS for styling with a component library",
    ],
    rubric: [
      "Problem definition: Is the problem clearly stated and validated?",
      "Feature scoping: Are features prioritized (must-have vs nice-to-have)?",
      "Technical execution: Does the app work end-to-end without errors?",
      "User experience: Is the UI intuitive and polished?",
      "Documentation: Is there a README with setup instructions and decisions?",
    ],
  },
  pjm: {
    title: "Project Manager Capstone Template",
    brief: "Build a project management tool that demonstrates your ability to plan, track, and report on work. The project should help teams coordinate and maintain visibility into progress.",
    requirements: [
      "Project and task creation with status tracking",
      "Timeline or Gantt-style visualization",
      "Team member assignment and workload view",
      "Status reports or automated progress summaries",
      "Notification system (email or in-app)",
    ],
    architecture: [
      "Next.js app with server and client components",
      "Supabase for auth, database, and row-level security",
      "Cron job or webhook for scheduled report generation",
      "Charts library for data visualization",
    ],
    rubric: [
      "Planning clarity: Are milestones and deliverables well-defined?",
      "Progress tracking: Can stakeholders see status at a glance?",
      "Risk management: Does the tool surface blockers or delays?",
      "Technical execution: Is the app reliable and performant?",
      "Presentation: Can you demo the project confidently?",
    ],
  },
  ba: {
    title: "Business Analyst Capstone Template",
    brief: "Build a tool that demonstrates your ability to gather requirements, model processes, and bridge business needs with technical solutions. The project should make analysis work more efficient or accessible.",
    requirements: [
      "Structured data input with validation",
      "Search and filtering across records",
      "Export capability (PDF, CSV, or structured output)",
      "Role-based views (admin vs viewer)",
      "Audit trail or change history",
    ],
    architecture: [
      "Next.js app with form-heavy UI patterns",
      "Supabase for structured data storage and RLS",
      "PDF generation for reports or exports",
      "Data validation with schema enforcement",
    ],
    rubric: [
      "Requirements clarity: Are acceptance criteria well-defined?",
      "Data modeling: Is the schema normalized and well-structured?",
      "Process documentation: Are workflows documented?",
      "Technical execution: Does the app handle edge cases?",
      "Stakeholder communication: Is the README written for non-technical readers?",
    ],
  },
  bi: {
    title: "Business Intelligence Capstone Template",
    brief: "Build a data tool that demonstrates your ability to collect, transform, and visualize data for decision-making. The project should turn raw data into actionable insights.",
    requirements: [
      "Data ingestion from at least one source (API, CSV, or database)",
      "Data transformation and aggregation logic",
      "Interactive dashboard with charts and filters",
      "Scheduled refresh or real-time updates",
      "Export or sharing capability",
    ],
    architecture: [
      "Next.js app with server components for data queries",
      "Supabase for data storage and materialized views",
      "Charts library (Recharts, Chart.js, or similar)",
      "API routes for data pipeline operations",
    ],
    rubric: [
      "Data pipeline: Is the ETL process reliable and documented?",
      "Visualization: Do charts tell a clear story?",
      "Performance: Does the dashboard load quickly with real data?",
      "Technical execution: Is SQL or data logic well-structured?",
      "Business value: Would a stakeholder find this useful?",
    ],
  },
};

interface CapstoneSuggestionsProps {
  roleTrack: RoleTrack | null;
  isPremium?: boolean;
}

export function CapstoneSuggestions({ roleTrack, isPremium }: CapstoneSuggestionsProps) {
  const role = roleTrack ?? "pm";
  const ideas = CAPSTONE_IDEAS[role];
  const template = CAPSTONE_TEMPLATES[role];

  return (
    <div className="space-y-6">
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

      {isPremium && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h3 className="font-semibold">{template.title}</h3>
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="mb-1 text-sm font-medium">Project Brief</h4>
              <p className="text-sm text-muted-foreground">{template.brief}</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Requirements</h4>
              <ul className="space-y-1">
                {template.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Suggested Architecture</h4>
              <ul className="space-y-1">
                {template.architecture.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Evaluation Rubric</h4>
              <ul className="space-y-1">
                {template.rubric.map((criterion) => (
                  <li key={criterion} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green-500/60" />
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

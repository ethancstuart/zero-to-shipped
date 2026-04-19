export interface Template {
  id: string;
  title: string;
  description: string;
  stack: string;
  free: boolean;
  content: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'blank-canvas',
    title: 'Blank Canvas',
    description: 'Universal starter for any project — fill in your stack and go',
    stack: 'Any',
    free: true,
    content: `# Project Overview
[TODO: Brief description of this project — what it does, who it's for]

# Tech Stack
[TODO: e.g., Next.js 14, TypeScript, Tailwind CSS, Vercel]

# Architecture
[TODO: Describe the high-level architecture — routing strategy, data flow, key abstractions]

# Key Commands
- \`npm run dev\` — start development server
- \`npm run build\` — production build
- \`vercel\` — deploy to Vercel

# Conventions
[TODO: Naming conventions, patterns, or project-specific rules to follow]

# File Structure
[TODO: Describe the important directories and their purpose]

# Important Notes
- \`.env.local\` is gitignored — copy \`.env.example\` and fill in real values
- Add any constraints or "never do this" rules here`,
  },
  {
    id: 'nextjs-supabase',
    title: 'Next.js + Supabase',
    description: 'Full-stack production stack with auth, database, Stripe, and Vercel',
    stack: 'Next.js, Supabase, Stripe, Vercel',
    free: false,
    content: `# [Project Name] — Next.js + Supabase App

## Project Overview
[One paragraph: what this app does, who uses it, what problem it solves]

## Tech Stack
- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- Supabase (Postgres + Auth + Storage)
- Stripe (payments)
- Vercel (hosting + analytics)
- Resend (transactional email)

## Architecture
- Route groups: \`(marketing)\` for public pages, \`(app)\` for authenticated, \`(public)\` for shared
- Auth: Supabase Auth with Google OAuth, callback at \`/auth/callback\`
- Middleware: protects \`(app)\` routes, passes through \`(marketing)\` and \`(public)\`
- Server components by default; "use client" only when you need interactivity or browser APIs

## Key Commands
- \`npm run dev\` — start dev server (localhost:3000)
- \`npm run build\` — production build (runs sync-content if applicable)
- \`npm run lint\` — ESLint
- \`npm run typecheck\` — TypeScript check without emitting
- \`vercel\` — deploy to Vercel

## File Structure
\`\`\`
src/
  app/
    (marketing)/     # Landing page, pricing, waitlist — no auth required
    (app)/           # Dashboard, settings, core features — auth required
    (public)/        # Public-facing user pages (/u/[username] etc.)
    auth/callback/   # Supabase OAuth callback
    api/             # API routes (Stripe webhooks, crons, etc.)
  components/
    layout/          # Nav, sidebar, footer, theme toggle
    ui/              # shadcn/ui components
  lib/
    supabase/        # Supabase client (browser + server)
    stripe.ts        # Stripe client singleton
    constants.ts     # App-wide constants (site URL, tier limits)
    utils.ts         # Shared utility functions
  types/             # TypeScript interfaces
\`\`\`

## Supabase Conventions
- All DB queries go through \`src/lib/supabase/\` — never instantiate the client inline
- Use \`createServerClient()\` in Server Components and Route Handlers
- Use \`createBrowserClient()\` in Client Components
- Migrations live in \`supabase/migrations/\` — run \`supabase db push\` to apply

## Stripe Conventions
- Webhook handler at \`src/app/api/stripe/webhook/route.ts\`
- Always verify the webhook signature before processing
- Use \`process.env.STRIPE_SECRET_KEY\` server-side only — never expose to client
- Idempotency: check \`processed_events\` table before handling any webhook event

## Auth Conventions
- Protected routes: handled by middleware — do not add auth checks to every page
- User profile: auto-created on first sign-in via Supabase trigger
- Server components: use \`await getUser()\` from \`src/lib/supabase/server.ts\`

## Coding Conventions
- TypeScript strict — never use \`any\`
- Server components default — "use client" only for interactivity
- Mobile-first responsive design
- Dark theme default (next-themes)
- Never commit secrets — use \`.env.local\` for local, Vercel env vars for production

## Important Notes
- \`.env.local\` is gitignored — copy \`.env.example\` and add keys
- Sentry: set \`NEXT_PUBLIC_SENTRY_DSN\` for error tracking
- CAN-SPAM: unsubscribe links use HMAC tokens, verify before removing subscribers`,
  },
  {
    id: 'data-dashboard',
    title: 'Data Dashboard',
    description: 'Python/Streamlit dashboard for BAs and BI engineers',
    stack: 'Python, Streamlit, SQLite/Postgres',
    free: false,
    content: `# [Project Name] — Data Dashboard

## Project Overview
[One paragraph: what data this dashboard shows, who uses it, what decisions it supports]

## Tech Stack
- Python 3.11+
- Streamlit (UI framework)
- Pandas (data manipulation)
- Plotly (charts and visualizations)
- SQLite (local) / PostgreSQL (production)
- python-dotenv (environment variables)

## Key Commands
- \`pip install -r requirements.txt\` — install dependencies
- \`streamlit run app.py\` — start the dashboard (localhost:8501)
- \`python scripts/load_data.py\` — refresh data from source
- \`pytest tests/\` — run tests

## File Structure
\`\`\`
app.py                  # Main Streamlit app (entry point)
pages/                  # Multi-page views (Streamlit pages)
data/
  raw/                  # Original source data (gitignored if large)
  processed/            # Cleaned, transformed data
components/
  charts.py             # Reusable chart functions
  filters.py            # Sidebar filter widgets
  metrics.py            # KPI card components
lib/
  db.py                 # Database connection and queries
  transforms.py         # Data transformation logic
  utils.py              # Shared helper functions
tests/                  # Unit tests for transforms and utils
.env.example            # Environment variable template
requirements.txt        # Python dependencies
\`\`\`

## Data Conventions
- Raw data is never modified — always work with copies
- All date fields stored as ISO 8601 strings (YYYY-MM-DD)
- Column names in snake_case throughout
- Null handling: explicitly check for None/NaN before calculations
- Large datasets: use \`@st.cache_data\` for expensive queries

## Streamlit Conventions
- Sidebar: all filters and controls
- Main area: charts and data tables
- \`st.session_state\` for shared state between components
- Use \`st.cache_data\` for any function that reads from DB or disk
- Error handling: \`st.error()\` for user-visible errors, never let the app crash silently

## Database Conventions
- All queries in \`lib/db.py\` — never inline SQL in UI components
- Use parameterized queries — never f-string SQL with user input
- Local: SQLite at \`data/dashboard.db\`
- Production: connection string from \`DATABASE_URL\` env var

## Important Notes
- \`.env\` is gitignored — copy \`.env.example\` and fill in real values
- Never commit data files to git — add \`data/raw/\` to .gitignore
- For secrets: use environment variables, never hardcode API keys`,
  },
  {
    id: 'automation-project',
    title: 'Automation Project',
    description: 'Scripts, cron jobs, and pipelines in Python or Node.js',
    stack: 'Python, Node.js, cron, Resend',
    free: false,
    content: `# [Project Name] — Automation Project

## Project Overview
[One paragraph: what this automation does, what triggers it, what it produces or sends]

## Tech Stack
- Python 3.11+ or Node.js 20+
- cron (scheduling) — or Vercel crons / GitHub Actions
- Resend (email notifications)
- SQLite or PostgreSQL (if state needs to persist)
- python-dotenv / dotenv (environment variables)

## Key Commands
- \`python main.py\` or \`node index.js\` — run once manually
- \`python main.py --dry-run\` — simulate without side effects
- \`pytest tests/\` — run tests
- \`crontab -e\` — edit system cron schedule (if running locally)

## File Structure
\`\`\`
main.py (or index.js)   # Entry point — orchestrates the pipeline
steps/                  # Individual pipeline steps (one file per step)
  fetch.py              # Data collection
  transform.py          # Data processing / filtering
  notify.py             # Email / Slack / webhook notifications
lib/
  db.py                 # Database connection and state storage
  email.py              # Email sending via Resend
  utils.py              # Shared helpers (retry logic, logging, etc.)
tests/                  # Unit tests for each step
scripts/
  backfill.py           # One-time scripts (not part of regular run)
.env.example            # Environment variable template
requirements.txt        # Python dependencies (or package.json)
\`\`\`

## Pipeline Conventions
- Each step is idempotent — running it twice produces the same result
- Dry run mode: \`--dry-run\` flag skips all writes and sends
- Logging: use structured logging (INFO for normal flow, WARNING for skipped items, ERROR for failures)
- Each step returns data to the next — no global mutable state
- Failures: log the error, send an alert if critical, never silently swallow

## Error Handling
- Wrap external API calls in try/except with retry logic (max 3 retries, exponential backoff)
- Log both the error AND the context that caused it (which record, which ID, etc.)
- If a step fails, decide: fail-fast (stop the pipeline) or fail-soft (skip and continue)
- State table in DB: track which records have been processed to avoid duplicates

## Scheduling
- Local cron: add to crontab — \`0 9 * * 1 /path/to/run.sh\` (Monday 9am)
- Vercel cron: add to \`vercel.json\` under "crons" array
- GitHub Actions: use \`.github/workflows/cron.yml\` with \`schedule: cron()\` trigger
- Always log the run timestamp and record count in a \`runs\` table

## Important Notes
- \`.env\` is gitignored — copy \`.env.example\` and fill in real values
- Add \`--dry-run\` support before touching any production system
- Never hardcode credentials — use environment variables
- Test with a small sample before running on full data`,
  },
];

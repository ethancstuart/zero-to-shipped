# Zero to Shipped

[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet.svg)](https://claude.ai/claude-code)

A gamified learning platform teaching PMs, Project Managers, Business Analysts, and BI Engineers to build real products with AI coding tools — from zero to shipped.

**Live at [zerotoship.app](https://zerotoship.app)**

## Features

- **16 Hands-On Modules** — From environment setup to capstone project, each module builds real skills with interactive checkpoints
- **Role-Specific Tracks** — Tailored learning paths for Product Managers, Project Managers, Business Analysts, and BI Engineers
- **Gamification** — XP system, streak tracking, badges, skill tree, leaderboard, and certificates
- **Freemium Model** — Core modules free, premium modules unlock advanced content via Stripe
- **Public Profiles** — Share your progress with a public profile and OG image cards

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript (strict)
- **Database & Auth:** Supabase (Postgres + Google OAuth + RLS)
- **Payments:** Stripe (one-time purchase)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Syntax Highlighting:** Shiki
- **Animations:** Framer Motion
- **Email:** Resend
- **Hosting:** Vercel (with Analytics + Speed Insights)

Built with [Claude Code](https://claude.ai/claude-code).

## Getting Started

```bash
# Clone the repo
git clone https://github.com/ethanstuart/zero-to-shipped.git
cd zero-to-shipped

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase, Stripe, and Resend keys

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Architecture

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation including file structure, conventions, and content pipeline.

## License

[MIT](./LICENSE)

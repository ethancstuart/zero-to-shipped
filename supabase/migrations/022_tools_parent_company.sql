-- Migration 022: Add parent_company + company_slug columns to tools and seed the mapping.
-- This enables grouping tools by parent company in the marketing routes
-- (/tools → /tools/[company] → /tools/[company]/[product]).

ALTER TABLE tools ADD COLUMN IF NOT EXISTS parent_company text;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS company_slug text;

-- Seed the company mapping for the 9 launch tools.
UPDATE tools SET parent_company = 'Anthropic', company_slug = 'anthropic' WHERE slug = 'claude-code';
UPDATE tools SET parent_company = 'OpenAI', company_slug = 'openai' WHERE slug = 'codex';
UPDATE tools SET parent_company = 'Google', company_slug = 'google' WHERE slug = 'gemini-cli';
UPDATE tools SET parent_company = 'Cursor', company_slug = 'cursor' WHERE slug = 'cursor';
UPDATE tools SET parent_company = 'Vercel', company_slug = 'vercel' WHERE slug = 'v0';
UPDATE tools SET parent_company = 'Replit', company_slug = 'replit' WHERE slug = 'replit';
UPDATE tools SET parent_company = 'StackBlitz', company_slug = 'stackblitz' WHERE slug = 'bolt';
UPDATE tools SET parent_company = 'Codeium', company_slug = 'codeium' WHERE slug = 'windsurf';
UPDATE tools SET parent_company = 'Lovable', company_slug = 'lovable' WHERE slug = 'lovable';

CREATE INDEX IF NOT EXISTS idx_tools_company ON tools(company_slug);

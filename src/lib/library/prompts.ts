export type PromptCategory = 'build' | 'debug' | 'refactor' | 'ship' | 'think' | 'pm';

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  prompt: string;
  free: boolean;
}

export const CATEGORY_LABELS: Record<PromptCategory, string> = {
  build: 'Build',
  debug: 'Debug',
  refactor: 'Refactor',
  ship: 'Ship',
  think: 'Think',
  pm: 'PM-Specific',
};

export const PROMPTS: Prompt[] = [
  // BUILD — 12 prompts, first 6 free
  {
    id: 'build-habit-tracker',
    title: 'Habit Tracker',
    description: 'Build a single-page app to track daily habits with streak counters',
    category: 'build',
    free: true,
    prompt: `Build me a single-page web application that tracks my daily habits.
I want to be able to:
- Add a new habit with a name
- Check off habits I completed today
- See a simple streak counter for each habit (consecutive days completed)
- Clear all habits

Use HTML, CSS, and JavaScript in a single file called index.html.
Make it look clean and modern with a blue and white color scheme.
The data should persist in the browser's local storage so it survives page refreshes.`,
  },
  {
    id: 'build-feature-tracker',
    title: 'Feature Request Tracker',
    description: 'Internal tool for triaging and prioritizing stakeholder feature requests',
    category: 'build',
    free: true,
    prompt: `Build a Feature Request Tracker as a single-page web application.

Requirements:
- A form to add new requests: title, description, submitter name, priority (P0/P1/P2/P3), status (New/In Review/Approved/Declined)
- A filterable table showing all requests, sortable by any column
- Click a row to expand and see the full description
- Status can be changed via a dropdown directly in the table
- Request count badges at the top showing how many are in each status

Constraints:
- Single HTML file, inline CSS and JavaScript, no external dependencies
- Do NOT add authentication, user accounts, or multi-user features
- Do NOT add a kanban board view — just the table
- Use local storage for data persistence

Definition of done: I can add requests, filter and sort the table, change statuses, and the data survives a page refresh.`,
  },
  {
    id: 'build-meeting-tracker',
    title: 'Meeting Action Item Tracker',
    description: 'Paste meeting notes and extract action items into a trackable table',
    category: 'build',
    free: true,
    prompt: `Build a Meeting Action Item Tracker as a single HTML file.

Layout (top to bottom):
1. Header: "Action Item Tracker"
2. Input section: A large text area (at least 8 rows) for meeting notes
3. An "Extract Action Items" button (blue, prominent)
4. Results section: A table with columns: Action Item, Owner, Due Date, Priority (High/Medium/Low), Status (Open/Complete)

Behavior:
- Look for patterns like "[Name] will [task] by [date]" or "Action: [task] - [Name]" or "TODO: [task]"
- If no owner found, default to "Unassigned"; if no date, default to "No date set"
- Each row has an inline status dropdown; completed items get strikethrough text
- Count badge: "3 open / 2 complete"

Constraints: No external dependencies, no AI/LLM API calls, no save/load feature.
Design: White background, dark gray text (#1F2937), blue accent (#2563EB).`,
  },
  {
    id: 'build-team-capacity',
    title: 'Team Capacity Planner',
    description: 'Spreadsheet-style weekly capacity tracker for a team of any size',
    category: 'build',
    free: true,
    prompt: `Build a Team Capacity Planner as a single-page web app.

Features:
- A table where each row is a team member (name, role)
- Columns represent weeks (show current week + next 4 weeks)
- Each cell is a dropdown: Available / Partial / Busy / Out
- Color-coded: green / yellow / orange / gray
- Summary row at bottom showing team availability per week
- Add/remove team members
- Local storage persistence

Constraints:
- Single HTML file, no external dependencies
- Do NOT add project assignment features
- Do NOT add hour-level tracking — just the status dropdown

Design: Clean spreadsheet-like layout, white background, minimal borders.`,
  },
  {
    id: 'build-personal-dashboard',
    title: 'Personal Dashboard',
    description: 'Good morning/afternoon/evening dashboard with tasks, notes, and clock',
    category: 'build',
    free: true,
    prompt: `Build a single-page personal dashboard as one HTML file.

Sections:
- A greeting that shows "Good morning/afternoon/evening" based on time of day
- A quick-add task list with checkboxes and delete buttons
- A notepad area for freeform text that auto-saves
- A section showing today's date and current time (updating live)

Design: clean, minimal, white background, dark text, blue accents.
Data should persist in local storage.`,
  },
  {
    id: 'build-bookmark-manager',
    title: 'Bookmark Manager',
    description: 'Organize links by category with search, export/import as JSON',
    category: 'build',
    free: true,
    prompt: `Build a single-page bookmark manager as one HTML file.

Features:
- Add a bookmark with a title, URL, and category (dropdown: Work, Learning, Tools, Other)
- Display bookmarks as cards grouped by category
- Search/filter across all bookmarks by title
- Click a bookmark to open it in a new tab
- Delete bookmarks with a confirmation
- Import/export bookmarks as JSON

Design: clean, modern, single-column layout. Local storage for persistence.`,
  },
  {
    id: 'build-analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Feature request analytics with summary cards, charts, and data table',
    category: 'build',
    free: false,
    prompt: `Build a Feature Request Analytics dashboard using data from a JSON file.

The data file (sample-data.json) contains feature requests with fields:
id, title, submitter, submitter_team, priority (P0-P3), status, submitted_date, resolved_date, category, effort_estimate.

Components:
1. SUMMARY CARDS: Total requests, Open requests, Avg days to resolution, Requests this month
2. CHARTS (use Chart.js): Bar chart (requests by category), Line chart (monthly trend), Donut chart (priority distribution)
3. DATA TABLE: All requests, sortable, filterable by status/priority/team
4. INSIGHTS: Stuck requests (In Review >30 days), top requesting teams

All charts and cards should update when filters are applied.
Single HTML file. Design: white background, blue accent, professional.`,
  },
  {
    id: 'build-quarterly-deck',
    title: 'Quarterly Review Deck',
    description: 'Navigate a keyboard-driven 8-slide presentation with dark navy design',
    category: 'build',
    free: false,
    prompt: `Build a presentation with 8 slides as a single HTML file. Navigate between slides with arrow keys.

Slide 1: Title — "Q1 Product Review" with subtitle and date
Slide 2: Agenda — 4 items
Slide 3: Key Metrics — 4 cards (number + label + trend indicator)
Slide 4: Feature Delivery — table with features, dates, status
Slide 5: Stakeholder Feedback — 3 quotes with attribution
Slide 6: Roadmap — horizontal timeline showing Q2-Q4
Slide 7: Risks & Dependencies — 2-column layout
Slide 8: Next Steps — numbered list with owners

Design: Dark navy background (#1E293B), white text, blue accent (#3B82F6).
One idea per slide, generous whitespace. Include print-to-PDF button.`,
  },
  {
    id: 'build-csv-formatter',
    title: 'CSV Report Formatter',
    description: 'Python script that filters, renames columns, and exports a clean CSV',
    category: 'build',
    free: false,
    prompt: `Build a Python script called format_report.py that:
1. Reads a CSV file from an "input" folder
2. Filters to only rows where status is "Active"
3. Renames columns: "emp_name" → "Employee Name", "dept" → "Department"
4. Sorts by Department, then by Employee Name
5. Adds a "Generated On" column with today's date
6. Writes the result to an "output" folder as a formatted CSV
7. Prints a summary: "Processed X records, Y active, saved to [filename]"

Include error handling:
- If the input folder doesn't exist, create it and print a helpful message
- If the CSV has unexpected columns, print which columns are missing`,
  },
  {
    id: 'build-weekly-summary',
    title: 'Weekly Summary Generator',
    description: 'Python script that combines CSV files into a markdown summary report',
    category: 'build',
    free: false,
    prompt: `Build a Python script called weekly_summary.py that:
1. Reads all CSV files in a "weekly-data" folder
2. For each file, calculates: total records, records by status (count and percentage), average processing time
3. Compiles into a summary markdown file with: date range covered, comparison table across files, highlights section noting anomalies (e.g., >20% error rate)
4. Saves to "reports/weekly-summary-[date].md"

Include logging (INFO for success, WARNING for issues, ERROR for failures) and error handling for missing files/folders.`,
  },
  {
    id: 'build-status-page',
    title: 'Status Page',
    description: 'Real-time service health dashboard with green/yellow/red indicators',
    category: 'build',
    free: false,
    prompt: `Build a status page as a single HTML file, similar to status.github.com.

Features:
- List of 6 services (API, Dashboard, Authentication, Database, CDN, Notifications)
- Each service has a green/yellow/red indicator and a current status label
- An overall system status banner at the top
- Incident history section showing last 5 events with date, affected service, and resolution note
- Auto-refreshes the displayed "last updated" timestamp every 60 seconds

Design: White background, clean sans-serif font, generous spacing. Green = #10B981, Yellow = #F59E0B, Red = #EF4444.
No external dependencies. Status data can be hardcoded for now.`,
  },
  {
    id: 'build-team-directory',
    title: 'Team Directory',
    description: 'Searchable team directory with role filters and profile cards',
    category: 'build',
    free: false,
    prompt: `Build a Team Directory as a single HTML file.

Features:
- Grid of team member cards: name, role, department, email, profile photo placeholder
- Search by name or role (client-side, instant)
- Filter by department (dropdown)
- Click a card to expand and see: bio, skills tags, LinkedIn URL field
- Add and remove team members via a form

Constraints:
- No authentication, no backend
- Use realistic placeholder data (at least 12 team members)
- Do NOT add org chart view — cards only

Design: White background, gray card borders, name in bold, role in muted gray. Responsive 3-column grid.`,
  },

  // DEBUG — 8 prompts, first 4 free
  {
    id: 'debug-explain-error',
    title: 'Explain This Error',
    description: 'Understand exactly what an error message means and how to fix it',
    category: 'debug',
    free: true,
    prompt: `I'm getting this error and I don't understand what it means:

[PASTE YOUR ERROR MESSAGE HERE]

This is happening in [describe what you were doing — e.g., "when I click the submit button" or "when I run npm run build"].

Please:
1. Explain what this error means in plain English
2. Tell me what is most likely causing it
3. Give me the exact steps to fix it
4. Tell me how to verify the fix worked`,
  },
  {
    id: 'debug-find-bug',
    title: 'Find the Bug',
    description: 'Describe unexpected behavior and get a specific fix with explanation',
    category: 'debug',
    free: true,
    prompt: `Something in my code isn't working as expected.

What I expected to happen: [DESCRIBE EXPECTED BEHAVIOR]
What actually happens: [DESCRIBE ACTUAL BEHAVIOR]

Here is the relevant code:
[PASTE CODE HERE]

Please:
1. Identify what is wrong
2. Explain why this is causing the unexpected behavior
3. Show me the corrected code
4. Add a comment explaining the fix so I remember it`,
  },
  {
    id: 'debug-slow-page',
    title: 'Why Is My Page Slow?',
    description: 'Diagnose performance issues and get specific optimization steps',
    category: 'debug',
    free: true,
    prompt: `My page feels slow. Here's what I'm seeing:
[DESCRIBE: loading time, which interactions feel laggy, any patterns you notice]

Here is the relevant code (component, query, or route):
[PASTE CODE HERE]

Please:
1. Identify the most likely performance bottleneck
2. Explain why it's slow
3. Give me 2-3 specific fixes in order of impact
4. Show the code changes for each fix

Don't suggest anything that would require a major architectural change.`,
  },
  {
    id: 'debug-trace-flow',
    title: 'Trace a Broken Flow',
    description: 'Follow a user action from click to server response to find where it breaks',
    category: 'debug',
    free: true,
    prompt: `Something is broken and I don't know where in the flow the problem is.

The user action: [e.g., "user clicks Submit on the login form"]
What should happen: [e.g., "they get logged in and redirected to the dashboard"]
What actually happens: [e.g., "nothing happens, no error message"]

Relevant files:
- Frontend: [PASTE component or form code]
- API route: [PASTE API handler code if applicable]

Please trace the entire flow from user action to response. At each step, tell me:
1. What should happen at this step
2. What to check to verify it's working
3. If you see a bug, where it is and how to fix it`,
  },
  {
    id: 'debug-typescript-error',
    title: 'Fix TypeScript Error',
    description: 'Resolve a TypeScript type error with an explanation of what went wrong',
    category: 'debug',
    free: false,
    prompt: `I have a TypeScript error I can't resolve:

Error: [PASTE FULL ERROR INCLUDING FILE + LINE NUMBER]

Code with the error:
[PASTE THE CODE]

Relevant types (if you know them):
[PASTE TYPE DEFINITIONS or say "unknown"]

Please:
1. Explain what the type error means
2. Show the corrected code
3. Explain the fix in one sentence so I understand what I got wrong
4. Tell me if there's a pattern I should follow to avoid this in the future`,
  },
  {
    id: 'debug-failing-test',
    title: 'Diagnose a Failing Test',
    description: 'Understand why a test is failing and fix either the test or the code',
    category: 'debug',
    free: false,
    prompt: `My test is failing and I'm not sure if the test is wrong or the code is wrong.

Test output:
[PASTE FULL TEST OUTPUT/ERROR]

The test:
[PASTE TEST CODE]

The code being tested:
[PASTE IMPLEMENTATION CODE]

Please:
1. Explain why the test is failing
2. Determine: is the test wrong, or is the implementation wrong?
3. Show the fix — whichever side needs changing
4. If the test was poorly written, show me a better version`,
  },
  {
    id: 'debug-loop',
    title: 'Infinite Loop or Freeze',
    description: 'Identify what is causing a page, script, or component to hang',
    category: 'debug',
    free: false,
    prompt: `My [page / script / component] is freezing or running forever.

What I see: [DESCRIBE — e.g., "the browser tab freezes when I click X" or "the script runs and never exits"]

Relevant code:
[PASTE THE CODE — focus on any loops, recursive calls, or useEffect hooks]

Please:
1. Identify what is causing the infinite loop or hang
2. Explain why the condition never exits
3. Show the corrected code with the fix
4. Tell me what I should have checked first — so I can diagnose this type of issue faster next time`,
  },
  {
    id: 'debug-api-mismatch',
    title: 'API Response Mismatch',
    description: 'Fix a disconnect between what the API returns and what the UI expects',
    category: 'debug',
    free: false,
    prompt: `My API is returning data but the UI isn't showing it correctly.

What the API returns (paste or describe the JSON response):
[PASTE API RESPONSE]

What the UI expects / how it renders the data:
[PASTE UI CODE]

What I actually see on screen:
[DESCRIBE — e.g., "blank", "undefined", "the wrong field value"]

Please:
1. Identify the mismatch between the API response shape and what the UI expects
2. Show which side needs to change (API or UI)
3. Give me the corrected code
4. Show me how to add a console.log to catch this type of mismatch faster next time`,
  },

  // REFACTOR — 6 prompts, all gated
  {
    id: 'refactor-simplify',
    title: 'Simplify This Function',
    description: 'Reduce a complex function to the clearest possible version',
    category: 'refactor',
    free: false,
    prompt: `This function works but it's hard to read. Please simplify it.

[PASTE YOUR FUNCTION]

Rules:
- Keep the exact same behavior — do not change what it does
- Remove unnecessary complexity (nested ternaries, redundant variables, overly clever one-liners)
- Split into smaller functions if it's doing more than one thing
- Rename variables to be self-documenting

Show me the simplified version and explain the 2-3 most important changes you made.`,
  },
  {
    id: 'refactor-add-types',
    title: 'Add TypeScript Types',
    description: 'Add proper TypeScript types to untyped JavaScript or loosely-typed code',
    category: 'refactor',
    free: false,
    prompt: `Please add proper TypeScript types to this code.

[PASTE YOUR CODE]

Requirements:
- Define interfaces for all objects and function parameters
- Use specific types (string, number, boolean) — avoid 'any'
- Use union types for fields that can be multiple values
- Export interfaces that are used in multiple places
- Do NOT change any logic — only add types

Show me the fully typed version. If you have to make a judgment call on a type, add a brief comment explaining why.`,
  },
  {
    id: 'refactor-extract',
    title: 'Extract Repeated Logic',
    description: 'Find duplicated code and consolidate it into a reusable helper',
    category: 'refactor',
    free: false,
    prompt: `I have repeated logic in my codebase that I want to consolidate.

Here are the places where it appears (paste 2-3 examples):
[PASTE REPEATED CODE EXAMPLES]

Please:
1. Identify the pattern being repeated
2. Write a reusable function (or hook, or utility) that captures it
3. Show me how to replace each instance with a call to the new function
4. Name the new function something that describes what it does, not how it does it

The new function should be in [src/lib/utils.ts / src/hooks/ — or tell me where makes sense].`,
  },
  {
    id: 'refactor-rename',
    title: 'Rename for Clarity',
    description: 'Rename variables, functions, and files to be self-documenting',
    category: 'refactor',
    free: false,
    prompt: `The naming in this code is unclear. Please suggest better names.

[PASTE YOUR CODE]

For each name that could be improved, tell me:
1. The current name
2. The suggested name
3. One sentence on why the new name is clearer

Rules:
- Function names should describe what they DO (verb + noun: getUserById, formatDate)
- Variable names should describe what they ARE (userName, not u or data)
- Boolean names should read as questions (isLoading, hasError, canSubmit)
- Don't abbreviate unless it's an industry standard (id, url, api are fine)

After suggestions, show me the fully renamed version of the code.`,
  },
  {
    id: 'refactor-split',
    title: 'Split a Large Component',
    description: 'Break a large component into smaller, focused pieces',
    category: 'refactor',
    free: false,
    prompt: `This component has grown too large and is doing too many things.

[PASTE YOUR COMPONENT]

Please:
1. Identify what separate responsibilities this component has
2. Propose how to split it (names + responsibilities for each new component)
3. Show the refactored version — the parent component and each new child component
4. Keep the exact same rendered output — no UI changes

Rules:
- Each new component should have one clear job
- Props should be typed interfaces
- Don't create a new component just to reduce line count — only split when it makes sense semantically`,
  },
  {
    id: 'refactor-constants',
    title: 'Replace Magic Numbers',
    description: 'Replace hardcoded values with named constants throughout a file',
    category: 'refactor',
    free: false,
    prompt: `This code has hardcoded values (magic numbers and strings) scattered throughout it.

[PASTE YOUR CODE]

Please:
1. Identify all hardcoded values that should be named constants
2. Create a constants section at the top of the file (or a separate constants file) with descriptive names
3. Replace every instance of the hardcoded value with the constant
4. Show me the full refactored file

Examples of what to look for:
- Numbers: timeouts, limits, thresholds, IDs (const MAX_RETRIES = 3)
- Strings: status values, route paths, event names (const STATUS_PENDING = 'pending')
- Skip truly obvious single-use values that would be noise as constants`,
  },

  // SHIP — 6 prompts, all gated
  {
    id: 'ship-readme',
    title: 'Write a README',
    description: 'Generate a clear README with setup, usage, and deployment instructions',
    category: 'ship',
    free: false,
    prompt: `Write a README.md for my project.

Project name: [YOUR PROJECT NAME]
What it does: [ONE SENTENCE DESCRIPTION]
Tech stack: [e.g., Next.js, Supabase, Tailwind CSS, Vercel]
Who uses it: [e.g., "internal team tool" / "public web app" / "personal project"]

Include sections:
1. Project overview (2-3 sentences)
2. Prerequisites (what needs to be installed)
3. Setup (clone → install → env vars → run dev server)
4. Environment variables (list each one with a description and example value)
5. Deployment (how to deploy to production)
6. Project structure (key folders and what they contain)

Write for someone joining the project for the first time. Use code blocks for all commands.`,
  },
  {
    id: 'ship-env-docs',
    title: 'Document Environment Variables',
    description: 'Generate a .env.example with descriptions for every environment variable',
    category: 'ship',
    free: false,
    prompt: `Create a .env.example file that documents all environment variables for my project.

Here are the variables currently in my .env.local:
[PASTE YOUR .env.local — remove actual secret values, just show the keys]

For each variable, the .env.example should include:
- The variable name
- A comment above it explaining: what it's for, where to get it, and whether it's required or optional
- A placeholder value that makes the format obvious (e.g., STRIPE_KEY=sk_test_... or PORT=3000)

Also generate a brief "Environment Setup" section for the README that tells a new developer what they need to configure before running the project.`,
  },
  {
    id: 'ship-vercel',
    title: 'Vercel Deploy Checklist',
    description: 'Get a pre-deploy checklist tailored to your tech stack',
    category: 'ship',
    free: false,
    prompt: `I'm about to deploy my project to Vercel for the first time. Generate a deployment checklist.

My stack: [e.g., Next.js 14, Supabase, Stripe, Resend]
Project type: [e.g., full-stack web app / static site / API]

The checklist should cover:
1. Environment variables (which ones Vercel needs, where to set them)
2. Build configuration (build command, output directory, Node version)
3. Database setup (migrations run? Connection string format for production?)
4. Domain configuration (if using a custom domain)
5. Pre-launch testing (what to test after first deploy, before going live)
6. Common gotchas for my specific stack

Format as a markdown checklist I can copy into a GitHub issue.`,
  },
  {
    id: 'ship-release-notes',
    title: 'Write Release Notes',
    description: 'Turn a list of commits or bullet points into readable release notes',
    category: 'ship',
    free: false,
    prompt: `Write release notes for version [VERSION NUMBER] of [PROJECT NAME].

Changes in this release:
[PASTE YOUR GIT LOG or bullet point list of what changed]

Audience: [e.g., "end users of a SaaS product" / "internal team" / "open source contributors"]

Format the release notes with:
- A short summary sentence at the top
- "What's New" section (new features)
- "Improvements" section (enhancements to existing things)
- "Bug Fixes" section (if any)
- "Breaking Changes" section (if any — highlight clearly)

Write for the audience, not for engineers. Explain what changed in terms of what users can now do, not what code changed.`,
  },
  {
    id: 'ship-security-review',
    title: 'Security Review',
    description: 'Audit your code for OWASP top-10 vulnerabilities before shipping',
    category: 'ship',
    free: false,
    prompt: `Please review this code for security vulnerabilities before I ship it.

[PASTE YOUR CODE — focus on: API routes, form handlers, database queries, auth logic]

Check for:
1. SQL injection (are user inputs ever concatenated into queries?)
2. XSS (is user-provided content ever rendered as HTML without sanitization?)
3. CSRF (are state-changing requests protected?)
4. Exposed secrets (are API keys or passwords visible in the code?)
5. Insecure direct object references (can users access other users' data by guessing IDs?)
6. Missing input validation (are inputs validated on the server, not just the client?)

For each issue found: show the vulnerable line, explain the risk, show the safe version.
If no issues found, tell me what you checked and confirm it looks safe.`,
  },
  {
    id: 'ship-api-docs',
    title: 'Generate API Documentation',
    description: 'Create clear API reference docs from your route handlers',
    category: 'ship',
    free: false,
    prompt: `Generate API documentation for my routes.

[PASTE YOUR API ROUTE HANDLERS — include the path, method, request shape, and response shape]

For each endpoint, generate a documentation block with:
- Method + path (e.g., POST /api/users)
- One-sentence description of what it does
- Request body (field name, type, required/optional, description)
- Response body (success shape + example)
- Error responses (status codes + when they occur)
- Authentication required: yes/no

Format as markdown so I can paste it into a README or a docs page.`,
  },

  // THINK — 6 prompts, all gated
  {
    id: 'think-brainstorm',
    title: 'Brainstorm Features',
    description: 'Generate a broad list of feature ideas for a product or tool',
    category: 'think',
    free: false,
    prompt: `I'm working on [DESCRIBE YOUR PRODUCT — what it does, who uses it, the main problem it solves].

Brainstorm 15 feature ideas that would make it significantly more valuable to users.

Rules:
- Do NOT suggest: [LIST 2-3 OBVIOUS ONES YOU'VE ALREADY THOUGHT OF]
- Include at least 3 ideas that would make most product managers uncomfortable
- Include at least 2 ideas that are counterintuitive — features that involve doing LESS, not more
- Vary scope: some should be 1-day builds, some should be week-long projects

For each idea: one sentence on what it is, one sentence on why it would matter.`,
  },
  {
    id: 'think-spec',
    title: 'Write a Feature Spec',
    description: 'Turn a vague idea into a clear, buildable specification',
    category: 'think',
    free: false,
    prompt: `Help me write a spec for this feature idea:

Feature: [DESCRIBE THE IDEA IN 1-3 SENTENCES]
Product context: [WHAT DOES YOUR PRODUCT DO? WHO ARE THE USERS?]
Problem it solves: [WHAT USER PAIN DOES THIS ADDRESS?]

Write a feature spec with these sections:
1. Problem statement (the user pain, not the solution)
2. Proposed solution (what we're building)
3. User stories (3-5 "As a [user], I want to [action] so that [outcome]" stories)
4. Acceptance criteria (specific, testable conditions for "done")
5. Out of scope (what this feature explicitly will NOT do)
6. Open questions (things we need to decide before building)

Keep it under 500 words. Concrete and buildable, not aspirational.`,
  },
  {
    id: 'think-pressure-test',
    title: 'Pressure-Test a Design',
    description: 'Find the weak points in a plan before you commit to building it',
    category: 'think',
    free: false,
    prompt: `I'm about to build this feature and I want you to pressure-test the design before I start.

My plan:
[DESCRIBE WHAT YOU'RE BUILDING AND HOW]

Please act as a skeptical senior engineer reviewing this. Tell me:
1. What assumptions am I making that could be wrong?
2. What edge cases am I not thinking about?
3. What will break as soon as real users touch this?
4. Is there a simpler approach I haven't considered?
5. What would you build differently and why?

Be direct. Don't soften feedback. I'd rather hear hard things now than after I've shipped.`,
  },
  {
    id: 'think-user-stories',
    title: 'Write User Stories',
    description: 'Generate a backlog of user stories from a feature idea or PRD',
    category: 'think',
    free: false,
    prompt: `Write user stories for this feature:

Feature: [DESCRIBE THE FEATURE]
Users: [WHO ARE THE PEOPLE USING THIS? e.g., "product managers at B2B SaaS companies"]

Generate 8-12 user stories using the format:
"As a [user type], I want to [action] so that [outcome/benefit]."

Then for each story, add:
- Acceptance criteria (2-3 specific, testable conditions)
- Priority: Must Have / Should Have / Nice to Have
- Rough effort: Small (hours) / Medium (1-2 days) / Large (3+ days)

At the end, identify which 3 stories form the minimum viable version of this feature.`,
  },
  {
    id: 'think-evaluate',
    title: 'Evaluate Two Approaches',
    description: 'Get an objective comparison of two technical or product approaches',
    category: 'think',
    free: false,
    prompt: `I'm deciding between two approaches and I want an objective evaluation.

Context: [WHAT PROBLEM ARE YOU SOLVING?]

Option A: [DESCRIBE FIRST APPROACH]

Option B: [DESCRIBE SECOND APPROACH]

Evaluate both on:
1. Implementation complexity (which takes longer to build and why)
2. Maintainability (which is easier to change later)
3. User experience (which produces better outcomes for users)
4. Risk (what could go wrong with each)
5. Reversibility (how hard is it to switch approaches later)

End with a recommendation and the one most important reason for it.`,
  },
  {
    id: 'think-anti-obvious',
    title: 'Anti-Obvious Brainstorm',
    description: 'Generate unconventional ideas by excluding the predictable ones first',
    category: 'think',
    free: false,
    prompt: `I need creative ideas for: [DESCRIBE YOUR CHALLENGE OR QUESTION]

Context: [WHAT HAVE YOU ALREADY TRIED OR CONSIDERED?]

Rules:
- Do NOT suggest any of these obvious answers: [LIST 3-5 PREDICTABLE IDEAS]
- Give me 10 ideas that are less conventional
- At least 3 should be ideas that feel slightly uncomfortable or counterintuitive
- At least 2 should involve subtracting or removing something rather than adding

For each idea: one sentence on what it is, one sentence on why it might work despite seeming strange.`,
  },

  // PM-SPECIFIC — 6 prompts, all gated
  {
    id: 'pm-prd',
    title: 'Write a PRD',
    description: 'Generate a complete product requirements document from a rough idea',
    category: 'pm',
    free: false,
    prompt: `Write a Product Requirements Document (PRD) for this feature.

Feature name: [NAME]
One-line summary: [WHAT IT DOES]
Problem it solves: [USER PAIN OR BUSINESS NEED]
Target users: [WHO WILL USE THIS]
Success metric: [HOW WILL YOU KNOW IT WORKED]

Structure the PRD with:
1. Executive summary (3-4 sentences)
2. Background and motivation (why now, what triggered this)
3. Goals and non-goals
4. User stories (5-7, prioritized)
5. Functional requirements (what it must do)
6. Non-functional requirements (performance, security, accessibility)
7. Design constraints (technical or UX limits)
8. Open questions and decisions needed
9. Timeline estimate (rough — don't overthink it)

Write it to be read by engineers, designers, and stakeholders. Clear and concrete, not vague.`,
  },
  {
    id: 'pm-stakeholder',
    title: 'Stakeholder Update',
    description: 'Write a concise project update email for a non-technical audience',
    category: 'pm',
    free: false,
    prompt: `Write a stakeholder update email for my project.

Project: [PROJECT NAME]
This week: [WHAT WAS ACCOMPLISHED]
Next week: [WHAT'S PLANNED]
Risks or blockers: [ANYTHING THAT COULD SLOW THINGS DOWN]
Decisions needed: [IF ANY — what you need sign-off on]
Audience: [e.g., "VP of Product and executive team — non-technical"]

Format:
- Subject line (clear, specific — not just "Project Update")
- 3-4 sentence summary at the top (what's happening and what it means)
- "This week" bullet points
- "Next week" bullet points
- "Needs your input" section (if applicable)
- Closing with next check-in date

Tone: professional but direct. No fluff. Under 300 words.`,
  },
  {
    id: 'pm-acceptance',
    title: 'Write Acceptance Criteria',
    description: 'Turn a vague story into specific, testable acceptance criteria',
    category: 'pm',
    free: false,
    prompt: `Write acceptance criteria for this user story:

User story: [PASTE YOUR USER STORY]

Additional context:
- Edge cases to consider: [ANY KNOWN EDGE CASES]
- Related functionality: [ANYTHING THIS INTERACTS WITH]
- Out of scope: [ANYTHING EXPLICITLY NOT INCLUDED]

Write acceptance criteria using the Given/When/Then format:
- Given [initial context]
- When [user action]
- Then [expected outcome]

Write 5-8 criteria covering: the happy path, common edge cases, error states, and boundary conditions.

After the criteria, flag any ambiguities or missing information that could cause disagreement about "done."`,
  },
  {
    id: 'pm-sprint-review',
    title: 'Sprint Review Summary',
    description: 'Write a clear sprint review from a list of completed tickets',
    category: 'pm',
    free: false,
    prompt: `Write a sprint review summary for Sprint [NUMBER].

Completed stories/tickets:
[PASTE YOUR COMPLETED TICKETS — title and a brief note on each]

Not completed (carried over):
[LIST ANY STORIES THAT DIDN'T MAKE IT]

Sprint goal was: [WHAT THE SPRINT WAS TRYING TO ACHIEVE]
Audience: [e.g., "the whole product team + engineering leads"]

Write a sprint review that includes:
1. Sprint goal: was it achieved? (yes / partially / no — be honest)
2. What shipped — grouped by theme, not ticket-by-ticket
3. What didn't ship and why (brief, no blame)
4. Key decisions or learnings from this sprint
5. What it means for next sprint

Under 400 words. Direct and factual.`,
  },
  {
    id: 'pm-roadmap',
    title: 'Product Roadmap Narrative',
    description: 'Write the "why behind the what" for a product roadmap',
    category: 'pm',
    free: false,
    prompt: `Write the narrative for a product roadmap.

Product: [NAME + ONE-LINE DESCRIPTION]
Time horizon: [e.g., "Q2-Q4 2026"]
Themes or bets: [LIST 3-4 STRATEGIC THEMES]
Audience: [e.g., "investors + sales team"]

Write a 300-word roadmap narrative that:
1. Opens with the single most important strategic bet
2. Explains the logic behind the sequencing (why Q2 before Q3)
3. Connects each theme to a user outcome, not just a feature list
4. Acknowledges what's not on the roadmap and why
5. Closes with what success looks like by the end of the horizon

This is NOT a list of features. It's the reasoning behind the plan.`,
  },
  {
    id: 'pm-retro',
    title: 'Retrospective Summary',
    description: 'Synthesize retrospective notes into actionable takeaways',
    category: 'pm',
    free: false,
    prompt: `Synthesize these retrospective notes into a clear summary with action items.

Raw notes from the retro:
[PASTE YOUR RAW NOTES — what went well, what didn't, ideas raised]

Team size: [NUMBER] people
Sprint context: [BRIEF DESCRIPTION OF WHAT THIS SPRINT WAS]

Write a retro summary with:
1. Top 3 things that went well (and why they mattered)
2. Top 3 things to improve (specific, not vague like "communication")
3. Action items: owner, what they'll do, by when (be concrete)
4. One overarching theme from this retro

Keep it under 300 words. Action items should be specific enough that you can check them off.`,
  },
];

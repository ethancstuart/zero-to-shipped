import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dev Environment Setup — Builder's Library — Zero to Ship",
  description:
    "Step-by-step guide to set up your full development environment on Mac or Windows. Homebrew, Node.js, Git, Cursor, Claude Code, GitHub CLI, Vercel CLI.",
  openGraph: {
    title: "Dev Environment Setup — Zero to Ship",
    description:
      "Mac and Windows setup guide for non-engineers. From zero to a working dev environment in 45 minutes.",
    url: `${siteConfig.url}/library/dev-environment`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Dev Environment Setup")}&subtitle=${encodeURIComponent("Mac + Windows Guide for Non-Engineers — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function DevEnvironmentPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        {/* Breadcrumb */}
        <Link
          href="/library"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Builder&apos;s Library
        </Link>

        <article className="prose prose-lg dark:prose-invert">
          <div className="not-prose mb-2 flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Setup
            </span>
            <span className="text-xs text-muted-foreground">45 min</span>
          </div>

          <h1>Dev Environment Setup</h1>

          <p className="lead">
            This guide gets you from a blank computer to a complete development environment
            in about 45 minutes. Follow it once and you&apos;ll have everything you need to build
            real software with AI tools.
          </p>

          <h2>What you&apos;re setting up</h2>
          <p>
            By the end of this guide, your computer will have:
          </p>
          <ul>
            <li><strong>Node.js</strong> — the runtime that powers most web projects</li>
            <li><strong>Git</strong> — version control (saving + tracking your code)</li>
            <li><strong>A modern terminal</strong> — where you run commands</li>
            <li><strong>Cursor</strong> — the AI-powered code editor</li>
            <li><strong>Claude Code</strong> — the AI agent that works directly in your terminal</li>
            <li><strong>GitHub CLI</strong> — manage your code repositories from the command line</li>
            <li><strong>Vercel CLI</strong> — deploy your projects to the web in seconds</li>
          </ul>
          <p>
            You don&apos;t need to understand all of these right now. Follow the steps in order and
            it will make sense as you use them.
          </p>

          <hr />

          <h2>Mac Setup</h2>
          <p>
            Mac comes with a terminal app, but we&apos;ll install Warp — it&apos;s dramatically better.
            Everything below uses the terminal.
          </p>

          <h3>Step 1: Install Homebrew</h3>
          <p>
            Homebrew is a package manager — it installs software for you so you don&apos;t have to
            hunt for installers. It&apos;s the first thing every Mac developer installs.
          </p>
          <p>Open Terminal (search for it in Spotlight) and run:</p>
          <pre><code className="language-bash">/bin/bash -c &quot;$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)&quot;</code></pre>
          <p>
            Follow the prompts. When it finishes, close and reopen your terminal.
            Verify it worked:
          </p>
          <pre><code className="language-bash">brew --version</code></pre>
          <p>You should see something like <code>Homebrew 4.x.x</code>.</p>

          <h3>Step 2: Install Node.js</h3>
          <pre><code className="language-bash">brew install node</code></pre>
          <p>Verify:</p>
          <pre><code className="language-bash">node --version
npm --version</code></pre>
          <p>You should see <code>v22.x.x</code> or higher for Node, and <code>10.x.x</code> for npm.</p>

          <h3>Step 3: Install Git</h3>
          <p>Mac may already have Git. Install the latest version anyway:</p>
          <pre><code className="language-bash">brew install git</code></pre>
          <p>Configure your identity (Git uses this for every commit):</p>
          <pre><code className="language-bash">git config --global user.name &quot;Your Name&quot;
git config --global user.email &quot;you@example.com&quot;</code></pre>

          <h3>Step 4: Install Warp Terminal</h3>
          <p>
            Warp is a modern terminal with AI built in. It understands plain English — type
            what you want to do and it suggests the command.
          </p>
          <pre><code className="language-bash">brew install --cask warp</code></pre>
          <p>
            Open Warp from your Applications folder. Use it for all terminal work going forward.
          </p>

          <h3>Step 5: Install Cursor</h3>
          <p>
            Cursor is the AI-powered code editor. It&apos;s built on VS Code, so everything
            looks familiar — but it has AI built into every part of it.
          </p>
          <pre><code className="language-bash">brew install --cask cursor</code></pre>
          <p>Open Cursor. Sign in with your Google account when prompted.</p>

          <h3>Step 6: Install Claude Code</h3>
          <p>
            Claude Code is an AI agent that runs in your terminal. It reads and edits files
            directly, runs commands, and handles multi-step tasks autonomously.
          </p>
          <pre><code className="language-bash">npm install -g @anthropic-ai/claude-code</code></pre>
          <p>
            You&apos;ll need an Anthropic API key. Get one at{" "}
            <strong>console.anthropic.com</strong> → API Keys → Create Key.
            Then add it to your environment:
          </p>
          <pre><code className="language-bash">echo &apos;export ANTHROPIC_API_KEY=&quot;your-key-here&quot;&apos; &gt;&gt; ~/.zshrc
source ~/.zshrc</code></pre>
          <p>Verify:</p>
          <pre><code className="language-bash">claude --version</code></pre>

          <h3>Step 7: Install GitHub CLI</h3>
          <pre><code className="language-bash">brew install gh</code></pre>
          <p>Authenticate:</p>
          <pre><code className="language-bash">gh auth login</code></pre>
          <p>
            Choose GitHub.com → HTTPS → Login with a web browser. Follow the prompts.
          </p>

          <h3>Step 8: Install Vercel CLI</h3>
          <pre><code className="language-bash">npm install -g vercel</code></pre>
          <p>Authenticate:</p>
          <pre><code className="language-bash">vercel login</code></pre>

          <hr />

          <h2>Windows Setup</h2>
          <p>
            On Windows, we&apos;ll use <strong>winget</strong> — the built-in Windows package manager
            (available on Windows 10/11). Open Windows Terminal (search for it in Start) and
            run each command.
          </p>

          <h3>Step 1: Install Node.js</h3>
          <pre><code className="language-bash">winget install OpenJS.NodeJS.LTS</code></pre>
          <p>
            Close and reopen Windows Terminal after installation. Verify:
          </p>
          <pre><code className="language-bash">node --version
npm --version</code></pre>

          <h3>Step 2: Install Git</h3>
          <pre><code className="language-bash">winget install Git.Git</code></pre>
          <p>Close and reopen terminal. Configure your identity:</p>
          <pre><code className="language-bash">git config --global user.name &quot;Your Name&quot;
git config --global user.email &quot;you@example.com&quot;</code></pre>

          <h3>Step 3: Install Windows Terminal (if not already installed)</h3>
          <pre><code className="language-bash">winget install Microsoft.WindowsTerminal</code></pre>
          <p>Windows Terminal supports tabs, themes, and multiple shell types. Use it going forward.</p>

          <h3>Step 4: Install Cursor</h3>
          <pre><code className="language-bash">winget install Anysphere.Cursor</code></pre>
          <p>Open Cursor from the Start menu. Sign in with your Google account.</p>

          <h3>Step 5: Install Claude Code</h3>
          <pre><code className="language-bash">npm install -g @anthropic-ai/claude-code</code></pre>
          <p>
            Get your Anthropic API key at <strong>console.anthropic.com</strong>.
            Add it as a permanent environment variable:
          </p>
          <ol>
            <li>Search &quot;Environment Variables&quot; in the Start menu</li>
            <li>Click &quot;Edit the system environment variables&quot;</li>
            <li>Click &quot;Environment Variables…&quot;</li>
            <li>Under User variables, click &quot;New&quot;</li>
            <li>Name: <code>ANTHROPIC_API_KEY</code> | Value: your key</li>
            <li>Click OK, then close and reopen your terminal</li>
          </ol>
          <p>Verify:</p>
          <pre><code className="language-bash">claude --version</code></pre>

          <h3>Step 6: Install GitHub CLI</h3>
          <pre><code className="language-bash">winget install GitHub.cli</code></pre>
          <p>Authenticate:</p>
          <pre><code className="language-bash">gh auth login</code></pre>

          <h3>Step 7: Install Vercel CLI</h3>
          <pre><code className="language-bash">npm install -g vercel
vercel login</code></pre>

          <hr />

          <h2>Verify everything works</h2>
          <p>
            Run each of these commands. If any fail, something wasn&apos;t installed correctly —
            scroll up and re-run that section.
          </p>
          <pre><code className="language-bash">node --version       # Should show v22.x.x or higher
npm --version        # Should show 10.x.x or higher
git --version        # Should show git version 2.x.x
claude --version     # Should show the Claude Code version
gh --version         # Should show gh version 2.x.x
vercel --version     # Should show Vercel CLI x.x.x</code></pre>
          <p>
            All six commands should return a version number. If you see &quot;command not found&quot;,
            close and reopen your terminal — sometimes the PATH needs to reload.
          </p>

          <hr />

          <h2>Your first 10 commands</h2>
          <p>
            These are the commands you&apos;ll use every single session. Bookmark this section.
          </p>

          <h3>Navigation</h3>
          <pre><code className="language-bash">pwd              # Where am I? (print working directory)
ls               # What&apos;s in this folder?
cd foldername    # Move into a folder
cd ..            # Move up one level
cd ~             # Go home (your user directory)</code></pre>

          <h3>Project work</h3>
          <pre><code className="language-bash">npm run dev      # Start the development server
git status       # What changed since my last save?
git add .        # Stage all changes
git commit -m &quot;what I did&quot;   # Save a snapshot
git push         # Push to GitHub</code></pre>

          <p>
            <strong>Pro tip:</strong> In Warp (Mac) and Windows Terminal, press{" "}
            <kbd>Ctrl+K</kbd> and describe what you want in plain English — the terminal
            generates the command for you.
          </p>

          <hr />

          <h2>What&apos;s next</h2>
          <p>Now that your environment is set up, two places to go:</p>
          <ul>
            <li>
              <Link href="/library/ai-workflow-os">
                <strong>AI Workflow OS</strong>
              </Link>{" "}
              — learn how to structure your AI development world with CLAUDE.md,
              MCP servers, and the build loop.
            </li>
            <li>
              <Link href="/preview/module-1">
                <strong>Module 1 of Zero to Ship</strong>
              </Link>{" "}
              — build your first real app in a single session. Free, no account required.
            </li>
          </ul>
        </article>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">Want to build this yourself?</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Module 1 walks you through building your first real app — step by step.
          </p>
          <Link
            href="/preview/module-1"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Module 1 Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

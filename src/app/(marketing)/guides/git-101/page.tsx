import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailGate } from "@/components/guides/email-gate";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Git for Product Managers — A Beginner's Guide",
  description:
    "Learn the 5 Git commands you'll use every day. A practical guide for PMs, BAs, and non-engineers who want to collaborate with developers and ship their own projects.",
  openGraph: {
    title: "Git for Product Managers — A Beginner's Guide",
    description:
      "Learn the 5 Git commands you'll use every day. A practical guide for PMs, BAs, and non-engineers.",
    url: `${siteConfig.url}/guides/git-101`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Git for Product Managers")}&subtitle=${encodeURIComponent("A Beginner's Guide — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Git101Page() {
  return (
    <div className="py-20">
      <article className="prose prose-lg mx-auto max-w-3xl px-4 dark:prose-invert">
        <h1>Git for Product Managers — A Beginner&apos;s Guide</h1>
        <p className="lead">
          You don&apos;t need to be an engineer to use Git. If you can save a file,
          you can use version control. Here&apos;s everything you need to know to start
          collaborating on code — or shipping your own projects with AI tools.
        </p>

        {/* Part 1: Visible */}
        <h2>What is Git?</h2>
        <p>
          Git is a version control system. Think of it as &ldquo;Track Changes&rdquo; for
          code — except it works across entire projects, not just single documents.
          Every change you make is saved as a snapshot called a <strong>commit</strong>.
          You can go back to any previous snapshot at any time.
        </p>
        <p>
          <strong>Why should you care?</strong> If you&apos;re building anything with AI
          coding tools like Claude Code or Cursor, Git is how you save your work, undo
          mistakes, and deploy to production. It&apos;s also how every engineering team
          you work with manages their code — so understanding it makes you a better
          collaborator.
        </p>

        <h2>5 Commands You&apos;ll Use Every Day</h2>

        <h3>1. <code>git status</code></h3>
        <p>
          Shows you what&apos;s changed since your last commit. Think of it as asking
          &ldquo;what did I change?&rdquo; Run this before every commit to make sure
          you&apos;re saving what you think you&apos;re saving.
        </p>
        <pre><code>git status</code></pre>

        <h3>2. <code>git add</code></h3>
        <p>
          Stages your changes — tells Git &ldquo;I want to include these files in my
          next snapshot.&rdquo; You can add specific files or everything at once.
        </p>
        <pre><code>{`git add index.html          # add one file
git add .                    # add everything`}</code></pre>

        <h3>3. <code>git commit</code></h3>
        <p>
          Takes the snapshot. Every commit needs a message describing what you changed
          and why. Good messages help you (and your team) understand the project history.
        </p>
        <pre><code>git commit -m &quot;Add pricing page with founding member CTA&quot;</code></pre>

        <h3>4. <code>git push</code></h3>
        <p>
          Uploads your commits to GitHub (or another remote). This is how you deploy
          to production, back up your work, and share with collaborators.
        </p>
        <pre><code>git push</code></pre>

        <h3>5. <code>git pull</code></h3>
        <p>
          Downloads the latest changes from the remote. If you&apos;re working with a
          team (or switching between computers), always pull before you start working.
        </p>
        <pre><code>git pull</code></pre>

        {/* Email gate */}
        <EmailGate>
          {/* Part 2: Gated */}
          <h2>Your First GitHub Repository</h2>
          <p>
            A <strong>repository</strong> (or &ldquo;repo&rdquo;) is a project folder
            tracked by Git. GitHub is where repos live online. Here&apos;s how to
            create your first one:
          </p>
          <ol>
            <li>
              Go to <strong>github.com</strong> and create a free account if you
              don&apos;t have one.
            </li>
            <li>
              Click the green <strong>&ldquo;New&rdquo;</strong> button on your
              dashboard.
            </li>
            <li>
              Name your repo (e.g., <code>my-first-project</code>), add a README,
              and click <strong>&ldquo;Create repository.&rdquo;</strong>
            </li>
            <li>
              Clone it to your computer: <code>git clone https://github.com/your-username/my-first-project.git</code>
            </li>
            <li>
              Make changes, then run: <code>git add . && git commit -m &quot;First commit&quot; && git push</code>
            </li>
          </ol>
          <p>
            That&apos;s it. You now have a project on GitHub. When you connect this to
            a platform like Vercel, every push automatically deploys your site.
          </p>

          <h2>Branching Basics</h2>
          <p>
            Branches let you work on new features without breaking what already works.
            Think of it as making a copy of your document to experiment on — if the
            experiment works, you merge it back. If it doesn&apos;t, you delete the
            branch and nothing is lost.
          </p>
          <pre><code>{`git checkout -b new-feature    # create and switch to a new branch
# ... make your changes ...
git add . && git commit -m "Add new feature"
git push -u origin new-feature  # push the branch to GitHub`}</code></pre>
          <p>
            On GitHub, you&apos;ll create a <strong>Pull Request</strong> (PR) to merge
            your branch back into <code>main</code>. This is how teams review code
            before it goes live — and it&apos;s a great habit even when you&apos;re
            working solo.
          </p>

          <h2>3 Mistakes Everyone Makes (And How to Fix Them)</h2>

          <h3>1. Committing sensitive data</h3>
          <p>
            Never commit passwords, API keys, or <code>.env</code> files. Add a{" "}
            <code>.gitignore</code> file to your project that excludes sensitive files.
            If you accidentally commit a secret, rotate the key immediately — Git
            history is permanent.
          </p>

          <h3>2. Giant commits with vague messages</h3>
          <p>
            &ldquo;Updated stuff&rdquo; doesn&apos;t help anyone. Commit small, commit often.
            Each commit should do one thing, and the message should say what and why.
            Good: <code>&quot;Fix mobile nav overlap on pricing page&quot;</code>.
            Bad: <code>&quot;changes&quot;</code>.
          </p>

          <h3>3. Never pulling before pushing</h3>
          <p>
            If you and a teammate both edit the same file, you&apos;ll get a merge
            conflict. The fix: always <code>git pull</code> before you start working,
            and before you push. Most conflicts are trivial to resolve — Git shows you
            both versions and you pick which to keep.
          </p>
        </EmailGate>

        {/* CTA */}
        <div className="not-prose mt-12 rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-xl font-bold">Ready to build something real?</h3>
          <p className="mb-6 text-muted-foreground">
            Zero to Ship takes you from Git basics to shipping a live product — with AI
            doing the heavy lifting. 16 modules, hands-on projects, and a certificate.
          </p>
          <Button render={<Link href="/pricing" />} size="lg">
            See Pricing
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </article>
    </div>
  );
}

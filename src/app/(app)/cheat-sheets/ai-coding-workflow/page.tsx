import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "AI Coding Workflow — Bonus Cheat Sheet" };

export default async function AICodingWorkflowPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Check if user has at least 1 qualified referral
  const { data: referredUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("referred_by", user.id);

  let qualifiedCount = 0;
  for (const referred of referredUsers ?? []) {
    const { data: progress } = await supabase
      .from("module_progress")
      .select("status")
      .eq("user_id", referred.id)
      .eq("module_number", 1)
      .eq("status", "completed")
      .maybeSingle();

    if (progress) qualifiedCount++;
  }

  if (qualifiedCount < 1) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Lock className="mx-auto mb-4 size-12 text-muted-foreground/40" />
        <h1 className="mb-2 text-2xl font-bold">Bonus Cheat Sheet Locked</h1>
        <p className="mb-6 text-muted-foreground">
          Refer 1 friend who completes Module 1 to unlock this bonus cheat sheet.
        </p>
        <Button render={<Link href="/referrals" />} variant="outline">
          Go to Referrals
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <span className="mb-2 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
          Referral Bonus
        </span>
        <h1 className="text-3xl font-bold">AI Coding Workflow</h1>
        <p className="mt-2 text-muted-foreground">
          The step-by-step workflow for building features with AI coding tools.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert">
        <h2>The 5-Step AI Coding Workflow</h2>
        <p>
          This is the workflow that Zero to Ship students use to build real features
          with AI coding tools. It works with Claude Code, Cursor, or any AI
          assistant.
        </p>

        <h3>Step 1: Spec Before You Prompt</h3>
        <p>
          Before you open your AI tool, write a clear specification of what you want.
          Include: what the feature does, who uses it, what data it needs, and what
          success looks like. The better your spec, the better the output.
        </p>
        <p>
          <strong>Template:</strong> &ldquo;I want to build [feature] that [does what]
          for [who]. It needs [data/API]. Success = [measurable outcome].&rdquo;
        </p>

        <h3>Step 2: Start Small, Then Expand</h3>
        <p>
          Don&apos;t ask for the entire feature in one prompt. Start with the
          smallest working version, verify it works, then add complexity. Each
          prompt should produce something you can test immediately.
        </p>

        <h3>Step 3: Read Before You Accept</h3>
        <p>
          Never blindly accept AI output. Read the generated code, even if you
          don&apos;t understand every line. Look for: hardcoded values, missing error
          handling, security issues (API keys in client code), and things that
          don&apos;t match your spec.
        </p>

        <h3>Step 4: Test in the Browser</h3>
        <p>
          After each change, open your browser and test the feature manually.
          Check: does it look right? Does it work on mobile? Does it handle edge
          cases (empty state, error state, loading state)?
        </p>

        <h3>Step 5: Commit and Push</h3>
        <p>
          Once something works, commit it immediately. Don&apos;t wait until
          &ldquo;everything is done.&rdquo; Small, frequent commits let you roll back
          if something breaks later. Use clear commit messages that describe what
          you changed and why.
        </p>

        <h2>Common Mistakes</h2>
        <ul>
          <li>
            <strong>Prompting too broadly</strong> — &ldquo;Build me a dashboard&rdquo;
            is worse than &ldquo;Create a card component that shows today&apos;s revenue
            with a percentage change from yesterday.&rdquo;
          </li>
          <li>
            <strong>Not testing between prompts</strong> — If you stack 5 changes
            without testing, you won&apos;t know which one broke things.
          </li>
          <li>
            <strong>Ignoring errors</strong> — When the AI says &ldquo;there might be
            an issue with...&rdquo;, it&apos;s usually right. Fix it before moving on.
          </li>
        </ul>

        <h2>Quick Reference</h2>
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Action</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Write spec</td>
              <td>5 min</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Prompt for smallest version</td>
              <td>2 min</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Review output</td>
              <td>3 min</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Test in browser</td>
              <td>2 min</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Commit</td>
              <td>1 min</td>
            </tr>
          </tbody>
        </table>
        <p>
          Total: ~13 minutes per feature iteration. Repeat until the feature is
          complete.
        </p>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailWrapper, emailButton } from '@/lib/email/templates'
import { generateEmailUnsubscribeToken } from '@/lib/email/tokens'

export async function POST(req: NextRequest) {
  const body = await req.json() as { email?: string; source?: string }
  const email = (body.email ?? '').trim().toLowerCase()
  const source = body.source ?? 'library'

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[toolkit-subscribe] RESEND_API_KEY not configured')
    return NextResponse.json({ error: 'Email service unavailable' }, { status: 503 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: dbError } = await supabase
    .from('library_subscribers')
    .upsert({ email, source }, { onConflict: 'email', ignoreDuplicates: true })

  if (dbError) {
    console.error('[toolkit-subscribe] db error:', dbError.message)
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const unsubToken = generateEmailUnsubscribeToken(email)
  const unsubUrl = `https://zerotoship.app/api/unsubscribe?token=${unsubToken}&type=library`

  try {
    await resend.emails.send({
      from: 'Zero to Ship <hello@zerotoship.app>',
      to: email,
      subject: "Your Builder's Library is unlocked",
      html: emailWrapper(
        `<p>You're in.</p>

        <p>All 44 prompts across 6 categories and all 4 CLAUDE.md templates are now unlocked — no account required.</p>

        <ul>
          <li><strong>Build</strong> — scaffold, spec, and ship apps with AI</li>
          <li><strong>Debug</strong> — the 5-step loop for when things break</li>
          <li><strong>Think</strong> — brainstorm, prioritize, and validate ideas</li>
          <li><strong>Refactor</strong> — clean up AI-generated code without breaking it</li>
          <li><strong>Ship</strong> — launch checklist, pre-flight checks, deployment prompts</li>
          <li><strong>PM</strong> — PRDs, stakeholder updates, roadmap narratives</li>
        </ul>

        <p style="text-align: center; margin: 28px 0;">
          ${emailButton("Go to the Library", "https://zerotoship.app/library", { large: true })}
        </p>

        <p>If you want to go further and actually build something — <a href="https://zerotoship.app/preview/module-1" style="color: #6366f1;">Module 1 is free</a>. No sign-up. Takes about an hour.</p>`,
        {
          unsubscribeUrl: unsubUrl,
          footerNote: "You're receiving this because you unlocked the Builder's Library.",
        }
      ),
    })
  } catch (err) {
    // Email failure is non-fatal — subscriber is already saved
    console.error('[toolkit-subscribe] email error:', err)
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'toolkit-page',
      }),
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

# Zero to Ship — Pre-Launch Runbook
# April 28, 2026 — everything Ethan must do before launch

Paste answers/tokens directly into Claude chat. Claude handles all Vercel env vars and deploys.
Check off each item as done.

---

## STATUS BOARD

- [x] Sentry DSN — done Apr 20
- [x] Sentry Auth Token — done Apr 20
- [x] Refund policy on paywall — already live (was a false alarm)
- [ ] Substack article TODOs filled
- [ ] LinkedIn post TODO filled
- [ ] Launch email sender confirmed
- [ ] Beehiiv ZTS publication created + credentials
- [ ] Buffer LinkedIn connected + profile IDs
- [ ] zts-marketing deployed to prod
- [ ] First cron triggered + Content Calendar verified
- [ ] Creator list answered (Q1)
- [ ] Newsletter budget answered (Q2)

---

## BLOCK 1 — CONTENT (you write, ~30 min)

### 1A — Substack Article
File: `docs/launch-content/substack-article-2-build-process.md`
Publish date: Monday April 21

Fill these 6 spots and paste back to Claude:

**[A] The origin moment** (line 32)
> The specific moment you decided to build ZTS. One concrete memory — a conversation with a PM friend, a backlogged prototype that never got built, a specific bad experience waiting on engineering. 2–3 sentences.

**[B] Previous role** (line 37)
> Replace `{{previous company or role}}` with your actual previous role or company name.

**[C] Who you sent the habit tracker to** (line 68)
> Replace `{{wife / partner / friend — pick}}` with whoever you actually sent it to.

**[D] Their reaction** (line 69)
> One line of dialogue or reaction when they saw the streak counter work. Whatever you remember.

**[E] Honest admission** (line 80)
> One or two things you're embarrassed by in the platform, or would build differently. This is what makes the article trustworthy — don't skip it.

**[F] What you're nervous about** (line 104)
> One honest sentence about a real concern going into launch. Not false modesty.

**[G] Sign-off** (line 116)
> How you want to close. "— Ethan" is fine.

---

### 1B — LinkedIn Post 2
File: `docs/launch-content/linkedin-post-2-product-in-action.md`
Publish date: Wednesday April 23

**[H] Who you sent the habit tracker to** (line 17)
> Same answer as [C] above — just confirm it's the same person.

---

### 1C — Launch Email Sender
File: `docs/launch-content/launch-email-announcement.md`
Send date: April 28, 8am ET

**[I] Confirm sending address** (line 27)
> Pick one:
> - `ethan@zerotoship.app` (more credible, branded)
> - `ethan.c.stuart@gmail.com` (personal, warmer)
> Claude will make sure the chosen address is set up in Resend.

---

## BLOCK 2 — BEEHIIV (~10 min)

You already have a Beehiiv account for NexusWatch. ZTS needs its own separate publication.

**Steps:**
1. Go to `app.beehiiv.com` — log in
2. Top-left corner: click your current publication name
3. Click **"New Publication"** from the dropdown
4. Name: `Zero to Ship` — fill in basics and create it
5. You'll land inside the new ZTS publication dashboard

**Get Publication ID:**
- Settings → Publication → scroll to bottom → copy the value that looks like `pub_xxxxxxxxxxxxxxxx`

**Get API Key:**
- Settings → Integrations → API → Generate new key
- (Check if it's the same as your NexusWatch API key — it may be account-level. The pub ID is what matters most.)

**Paste back to Claude:**
```
BEEHIIV_PUBLICATION_ID=pub_xxxxx
BEEHIIV_API_KEY=xxxxx   (or "same as NexusWatch")
```
Claude sets these in both `zts-marketing` and `zerotoship.app` Vercel projects.

---

## BLOCK 3 — BUFFER (~15 min)

You have X connected. You need to add LinkedIn and get profile IDs for both.

**Step 1 — Add LinkedIn:**
1. Go to `buffer.com` → your dashboard
2. Left sidebar: click **"Connect a channel"** or the **"+"** next to your channels
3. Select **LinkedIn** → authenticate with your LinkedIn account
4. Confirm it appears in your channel list

> **Free plan note:** Buffer free allows 3 channels. If you're at the limit, you'll need to upgrade ($6/mo Essentials) or disconnect an unused channel.

**Step 2 — Get your access token:**
1. Go to `buffer.com/developers/apps`
2. Create an app:
   - Name: `zts-marketing`
   - Callback URL: `https://zts-marketing.vercel.app`
3. Copy the **Access Token** shown after creation

**Step 3 — Get profile IDs:**
Run this in your terminal (replace `YOUR_TOKEN`):
```bash
curl "https://api.bufferapp.com/1/profiles.json?access_token=YOUR_TOKEN"
```
Find the `"id"` field for your LinkedIn profile and your X (Twitter) profile.

**Paste back to Claude:**
```
BUFFER_ACCESS_TOKEN=xxxxx
BUFFER_LINKEDIN_PROFILE_ID=xxxxx
BUFFER_TWITTER_PROFILE_ID=xxxxx
```
Claude sets these in `zts-marketing` Vercel, deploys to prod, triggers first cron, and confirms Content Calendar populates.

---

## BLOCK 4 — TWO QUESTIONS (unlock marketing sprint)

Claude writes personalized creator DMs, newsletter sponsorship targets, and LinkedIn posts for Apr 22 + Apr 26 once you answer these.

**Q1 — Creator list:**
> 3–5 LinkedIn PM/BA/PjM voices you've personally engaged with (liked, commented, messaged).
> Format: `Name — LinkedIn URL — why in one line`
> If you don't have any, just say so — Claude pivots to a different approach.

**Q2 — Newsletter budget:**
> A) Up to $500
> B) Up to $2,000
> C) Organic only

---

## WHAT CLAUDE HANDLES (no action from you)

Once you paste the values above, Claude does all of this:
- Sets all Vercel env vars across both projects
- Deploys `zts-marketing` to production
- Triggers first cron and verifies Content Calendar
- Drops your answers into the article and post files
- Drafts creator DMs and newsletter targets (after Q1+Q2)

---

## KEY DATES

| Date | Action |
|------|--------|
| Apr 21 (Mon) | Publish Substack Article 2 |
| Apr 22 (Tue) | LinkedIn post linking to Substack |
| Apr 23 (Wed) | LinkedIn Post 2 (habit tracker / product in action) |
| Apr 26 (Sat) | LinkedIn D-2 teaser |
| Apr 28 (Mon) | LAUNCH — 8am waitlist email, 9am LinkedIn Post 3 |
| Apr 29+ | zts-marketing engine takes over automated posting |

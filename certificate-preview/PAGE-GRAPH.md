# Page Interconnection Map + Findings — SPPQ / Shim

**Date:** 2026-10-04 · **Method:** static link-graph extraction + live HTTP verification.

---

## 1. Complete route inventory (18 routes)

| Route | Guard | Purpose |
|---|---|---|
| `/` | public | Marketing home |
| `/login` | public | Sign in (+ cross-app handoff on prod) |
| `/register` | public | Sign up |
| `/logout` | public | Session teardown |
| `/portal` | **member only** (non-member → `/dashboard`) | Member's certificate wallet |
| `/dashboard` | layout-guarded | Organizer overview + stats |
| `/dashboard/credentials` | layout-guarded | Certificate list, search, revoke |
| `/dashboard/events` | layout-guarded | Organizer's events |
| `/dashboard/events/:id` | + ownership | Attendees + issued certs |
| `/dashboard/templates` | layout-guarded | Template library |
| `/dashboard/templates/new` | layout-guarded | Create template |
| `/dashboard/templates/:id` | + ownership | Template editor |
| `/dashboard/generate` | layout-guarded | Bulk cert generation |
| `/dashboard/audit` | layout-guarded | Audit trail |
| `/validate` | **public** | Certificate verification (search) |
| `/validate/:id` | **public** | → redirects to `/validate?id=X` |
| `/attend/:id` | **public** | Attendee self check-in (via QR) |
| `/kiosk/:id` | organizer-only | Check-in display screen |
| `/scanner/:id` | organizer-only | QR scanner check-in |

---

## 2. Navigation graph — no broken links, no unintended dead ends

**Inbound link counts (verified):**
- Sidebar links all 6 dashboard sections: Overview, Credentials, Events, Templates, Generate, Audit.
- Navbar links: `/`, `/login`, `/register`, `/validate`, `/portal`, `/dashboard`, `/logout`.
- Events list → event detail, `/kiosk/:id`. Event detail → `/kiosk/:id`, `/scanner/:id`.
- Templates list → editor, `/dashboard/generate?templateId=X`.
- Dashboard → `/dashboard/templates`, `/dashboard/generate`, `/dashboard/events/:id`.
- Credentials/Portal/Generate → `/validate?id=X` (public view), `/validate/:id`.
- Attendee success → `/validate?id=X`.
- Scanner success → `/dashboard/events/:id`.

**`/attend/:id` has zero inbound links — CORRECT by design.** Attendees reach it by scanning the
event QR code, never by clicking through the app.

**Two validation URL forms coexist and both work:**
- `/validate?id=X` — canonical, used by all 6 in-app links and by the certificate QR code.
- `/validate/X` — a compatibility shim that `redirect()`s to the canonical form.
This is intentional and sound, not a bug.

**QR trust chain verified end-to-end:**
`CertificateView` builds `${origin}/validate?id=${certificateId}` → `QRCode.toDataURL()` → printed on
the certificate → recipient scans → `/validate?id=X` → `GET /api/certificates/:id` (public, 200).
The chain works.

---

## 3. Findings — designed features that are NOT connected

These are the real answer to "does the app actually do the thing".

### 3.1 `Wallet` model + `Certificate.walletId` — COMPLETELY UNUSED
- Schema defines a `Wallet` model and `Certificate.walletId` with a relation.
- **Nothing writes `walletId`. Nothing reads the `Wallet` model.** Zero references in `src/`.
- Meanwhile `/portal` (the member's certificate view) matches certificates by
  **`recipientEmail: user.email`** — a string match, not the relational link that was designed.

**Consequence:** the durable, relational way to attach a certificate to a user exists on paper but is
bypassed. Email matching works, but breaks if a user changes email or two accounts share an address.

### 3.2 `Certificate.isClaimed` / `claimedAt` — WRITTEN-ONLY-NEVER
- **Read** in `dashboard/page.tsx:53`, `stats/route.ts:42`, `DashboardClient` (claimed counts).
- **Never written** anywhere in the codebase.
- **Consequence:** the "claimed" metric on the dashboard is permanently **0**. There is no UI or API
  path that marks a certificate as claimed.

### 3.3 Cross-app handoff — production-only, inert locally
- `/login` calls `/api/auth/handoff` **only when `hostname.includes("shim-hq")`**.
- `handoff` issues a 60-second JWT and returns a URL to one of two **separate deployed apps**:
  `shim-wallet.vercel.app` (members) or `shim-studio.vercel.app` (organizers).
- Local fallback is hardcoded `http://localhost:3000`, but this app runs on **3100** — 3000 returns 502.
- **Not a live bug** (the branch never executes on localhost), but the hardcoded port is misleading
  and would bite anyone testing the handoff locally.

**This repo is one node of a 3-app ecosystem.** Its `/api/auth/consume` is the receiving end.

---

## 4. Recommendations (in priority order)

1. **Decide on the Wallet model.** Either wire it (create a Wallet on register, set `walletId` when a
   certificate is issued to a member, read it in `/portal`) or delete it. Half-built relations are
   worse than none. *Low risk, clear win.*
2. **Either implement claiming or remove the metric.** `isClaimed` is displayed but can never become
   true — the dashboard silently lies. Implement a claim action, or drop the stat.
3. **Never match certificates by email string.** If Wallet is wired, switch `/portal` to the relation.
4. **Fix the hardcoded `localhost:3000`** in `handoff` → read from an env var (`NEXT_PUBLIC_*_URL`).
5. **Minor:** `public/presets/*.jpg` are orphaned; `loadPreset()` copies only 2 fields (latent trap).

---

## 5. What is genuinely well-built

- Ownership checks are consistent at both page and API layers (15/18 routes scope by user).
- Public/gated boundary is drawn correctly and consistently.
- `/api/templates/[id]` is exemplary: auth → ownership → name dedup → referential-integrity guard.
- `/api/attend/[id]` upserts attendance (idempotent re-check-in) and auto-issues certificates — the
  full value chain works.
- Error handling is present throughout with sensible HTTP codes.

**Verdict:** the core platform is solid and correctly wired. The gaps are all *unfinished features*
(Wallet, claiming), not broken plumbing.

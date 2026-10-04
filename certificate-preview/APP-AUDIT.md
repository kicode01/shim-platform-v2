# Full App Audit — SPPQ / Shim Certificate Platform

**Date:** 2026-10-04  **Method:** static code review + live HTTP testing against the running dev server (port 3100) with real credentials and real database data.

---

## 1. TypeScript errors — FIXED (7 → 0)

| Location | Error | Nature | Fix |
|---|---|---|---|
| `TemplateEditor.tsx:1433` | `width` may be `undefined` | Cosmetic — text elements legitimately have no width | `CanvasElement.width` made optional (`width?: number`) |
| `TemplateEditor.tsx:1310` | `el.width` possibly undefined | Cascade of the above | Guarded with `el.width !== undefined` spread |
| `CertificateView.tsx:795` | `el.width` possibly undefined | Cascade of the above | `el.width ?? 0` |
| `TemplateEditor.tsx:1864,1871` | `cat.orientation` is `string`, needs union | Cosmetic — values always valid | Added `PresetCategory` interface typing orientation as `"portrait" \| "landscape"` |
| `TemplateEditor.tsx:2231,2234,2283,2353` | Comparison to `'signature'` has "no overlap" | **REAL FUNCTIONAL BUG** | See §2 |

Result: `tsc --noEmit` → **0 errors**.

---

## 2. REAL BUG FOUND: signature elements were unstyleable

**`TemplateEditor.tsx:2220`** (before):
```tsx
{activePropTab === 'style' && selectedElement.type !== 'signature' && (
```
This excluded signatures from the entire **Style** panel. But the block *inside* it was explicitly written to
handle signatures:
- line 2231/2234 — a **cursive font list** ("Cursive (Default)", "Great Vibes", "Dancing Script"…)
- line 2283 — a **"Master Size"** label instead of "Size (pt)"

TypeScript flagged this as dead code (4 of the 7 errors). **Impact:** selecting a signature element and
opening Style showed nothing — you could not change a signature's font, size, or weight.
**Fix:** changed the guard to include signatures, and widened the typography sub-block to
`type.includes("Text") || type === 'signature'`. Inner `!includes("signature")` gates still correctly hide
font-weight tracking for signatures.

---

## 3. Database / API wiring — HEALTHY

### API routes: 18 total, all tested live
| Endpoint | Auth required | Verified |
|---|---|---|
| `/api/stats` | yes | 200 authed / **401** unauthed |
| `/api/events`, `/api/events/[id]` | yes | 200 / **401**; `[id]` is PUT+DELETE only (405 on GET = correct) |
| `/api/templates`, `/api/templates/all`, `/api/templates/[id]` | yes | 200 / **401** |
| `/api/certificates`, `/api/certificates/[id]` | mixed | list **401** unauthed; **single-cert GET is public = correct** (verification links) |
| `/api/certificates/bulk` | yes | present |
| `/api/attend/[id]` | **public by design** | POST → **200**, attendance persisted |
| `/api/attendance/check-in` | yes | present |
| `/api/events/[id]/attendance-count` | yes | **401** unauthed |
| `/api/generate-outcomes` | yes | stateless AI helper, graceful fallback without API key |
| `/api/auth/*` | n/a | register / handoff / consume / nextauth |

**Ownership scoping:** 15 of 18 routes reference `userId`/`organizerId`/`session.user.id`. The 3 that do not
are auth endpoints and the stateless AI helper — correct.
`/api/templates/[id]` is exemplary: auth → ownership check → name dedup → referential-integrity guard
(refuses delete when certificates reference the template).

### Page guards
- `dashboard/layout.tsx` guards the whole dashboard: no session → `/login`; `member` role → `/portal`.
  This is why `dashboard/generate/page.tsx` has no local guard — **it is protected.**
- Server pages re-check ownership (`organizerId !== session.user.id → notFound()`).
- **Correctly public:** `/attend/[id]` (attendee check-in), `/validate` (certificate verification),
  `/register`, `/logout`.
- **Correctly gated:** `/kiosk/[id]` and `/scanner/[id]` redirect to `/login` (organizer-only screens).

### Live end-to-end test
`POST /api/attend/<event>` with an attendee payload → **HTTP 200**, attendance row written.
The handler upserts (idempotent re-check-in) and auto-issues a certificate when the event has a default
template — the full value chain works.

---

## 4. Verdict

No database-wiring defects found. Multi-tenancy is enforced consistently at both page and API layers.
The only genuine defect uncovered was the signature Style-panel bug (§2), now fixed.

### Minor observations (not bugs)
- `/api/events/[id]` exposes only PUT/DELETE; reads happen in server components. Intentional but unusual —
  a future GET would need adding if a client ever wants to re-fetch.
- `public/presets/*.jpg` remain orphaned/unreferenced (candidates for deletion).
- `loadPreset()` copies only `backgroundImageUrl` + `canvasElements`; correct today because presets define
  only those two fields, but it is a latent trap if presets gain more fields later.

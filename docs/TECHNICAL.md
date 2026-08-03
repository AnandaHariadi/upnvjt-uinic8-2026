# PACUL technical documentation

## 1. Architecture

```
Browser (PWA)
 ├─ Next.js App Router pages (React client components)
 │   ├─ Feature modules: green-action, eco-action, marketplace, local-impact-map,
 │   │  waste-report, carbon-tracker, collaboration-wall, profile, gov
 │   ├─ Zustand stores (persisted in localStorage)          ← demo persistence layer
 │   └─ lib/impact-aggregation.ts (district-level views)
 ├─ middleware.ts: gates /dashboard (pacul_token) and /gov (pacul_gov_token)
 └─ Route handlers (Node.js runtime, server-only)
     ├─ POST/GET /api/eco-action/verify → lib/server/{image-validation, rate-limit, google-vision}
     │                                    + lib/verification/evaluate.ts
     └─ POST /api/ocr/scan-bill        → lib/server/{image-validation, rate-limit, google-vision}
External: Google Cloud Vision REST API (optional), OpenStreetMap tiles
```

**Persistence.** There is no database. Stores are persisted in `localStorage`. `src/lib/demo-state.ts` resets every store to a deterministic seed when the demo account signs in, and to an empty state when a different user signs in on the same browser. With `NEXT_PUBLIC_DEMO_MODE=false`, `src/services/auth.service.ts` calls a REST backend at `NEXT_PUBLIC_API_URL`; that backend is not part of this repository.

## 2. Data model

### Green action record (`src/types/green-action.ts`)

| Field | Notes |
|---|---|
| `actionId`, `userId`, `actionType` | `waste_sorting`, `used_cooking_oil`, `tree_planting`, `energy_saving`, `sustainable_transport` |
| `evidenceThumbnail` | ~200 px EXIF-free data URL (local history only) |
| `evidenceHash` | SHA-256 of the original file (duplicate detection) |
| `verificationStatus` | `pending` · `verified` · `flagged` (Needs Review) · `rejected` |
| `verificationReason`, `verificationConfidence`, `verificationMode` | confidence is `null` in demo mode |
| `flags` | e.g. `duplicate_image`, `stale_evidence`, `action_mismatch`, `possible_screenshot`, `outside_pilot_area`, `ai_unavailable` |
| `location` | `{ kecamatanId, precision: "district" }` only |
| `estimatedImpact` | `{ metric, quantity, unit, estimatedCo2eKg \| null }` |
| `ecoPointsAwarded` | > 0 only when verified |

The same record feeds the history, EcoPoints ledger, challenges, badges, the community "Verified Action" badge, the impact map and the government analytics.

### Other stores

| Store | Key | Contents |
|---|---|---|
| `ecoPoints.store` | `pacul-ecopoints` | balance, lifetime, challengesCompleted, transactions (`earn` / `redeem`) |
| `greenAction.store` | `pacul-green-actions` | green action records |
| `ecoAction.store` | `pacul-challenges` | challenges (progress = verified actions of the matching type) |
| `voucher.store` | `pacul-bursa-pasar-hijau` | reward stock, user vouchers (expiry derived from the current time) |
| `wasteReport.store` | `pacul-waste-reports` | reports with status history |
| `collaboration.store` | `pacul-community` | posts; `verifiedAction` is set only by sharing a verified record |
| `auth.store` / `govAuth.store` | `pacul-auth` / `pacul-gov-auth` | citizen / government sessions |

## 3. API contracts

### `GET /api/eco-action/verify`

`{ mode: "live" | "demo", available: boolean, provider: string }`. It never contains key material.

### `POST /api/eco-action/verify`

Multipart form: `image` (JPEG/PNG/WebP, ≤ 5 MB, ≥ 320 px), `actionType`, optional `capturedAt` (epoch ms or ISO).

| Status | Meaning |
|---|---|
| 200 | `VerificationResponse` (see README) |
| 400 | Missing/unknown action type, missing image, unreadable or too-small image |
| 413 | Image too large |
| 415 | Not a JPEG/PNG/WebP (checked by magic bytes, not the client MIME type) |
| 429 | More than 10 requests per minute from one client (best effort) |

Decision rules (`src/lib/verification/evaluate.ts`):

- Labels matching an action's *strong* keywords count fully; *weak* keywords count at 0.6×. A small bonus is added for corroborating labels.
- A score ≥ 0.75 → **verified** (unless the image looks like a screenshot).
- The selected action scores < 0.5 while another action scores ≥ 0.75 → **rejected** with `action_mismatch` and a suggested action.
- A score ≥ 0.5 → **flagged** (Needs Review).
- Otherwise → **rejected**.
- SafeSearch adult/violence LIKELY or VERY_LIKELY → **rejected**.
- A duplicate image or stale evidence downgrades *verified* to *flagged*.

### `POST /api/ocr/scan-bill`

Multipart `image` (≤ 10 MB). Response: `{ success, mode, kwh, tagihan, confidence, raw_text, data }`. `confidence` is the share of expected bill fields that were found, not an OCR accuracy.

## 4. Fraud mitigation (prototype)

Fraud **mitigation**, not prevention:

| Control | Where |
|---|---|
| File type by magic bytes, size, minimum resolution | client + server |
| Duplicate image (own history, SHA-256 of the original) | client, blocks submission |
| Duplicate image across sessions (24 h, per server instance) | server, flags |
| Minimum 60 s between submissions; per-action daily limits | client |
| Per-IP rate limit (10/min) | server |
| Evidence older than 72 h | server, flags |
| Action/image mismatch, screenshot-like images, unsafe content | server (live mode) |
| Location outside the Surabaya bounds | client, flags |
| Rewards not scaled by self-reported quantity; supporting rewards capped | client |

Client-side checks can be bypassed by a determined user. Production requires server-side persistence of these rules.

## 5. Security

- Secrets: `GOOGLE_VISION_API_KEY` is read only in `src/lib/server/google-vision.ts` (guarded by `import "server-only"`), sent in the `x-goog-api-key` header, and never logged. The previous `NEXT_PUBLIC_GOOGLE_VISION_API_KEY` fallback and key-length logging were removed.
- Headers (`next.config.js`): CSP (no `unsafe-eval` in production, `frame-ancestors 'none'`, `object-src 'none'`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy: camera=(self), geolocation=(self), microphone=(), payment=()`, no `X-Powered-By`.
- Images: `next/image` loads only local assets (the wildcard remote pattern was removed).
- Sessions: citizen (`pacul_token`) and government (`pacul_gov_token`, `SameSite=Strict`, 1 day) cookies are separate. Middleware gates routes; the government dashboard also checks the government user client-side.
- Rendering: there is no `dangerouslySetInnerHTML`; user content is rendered as text. CSV export quotes fields and neutralises formula prefixes.
- Known gaps: demo tokens are unsigned; demo accounts (and their passwords) are stored in `localStorage`; rate limits are in-memory. No penetration test has been performed.

## 6. Privacy

See README → *Privacy and security*. Key design points: minimum data collection, optional permission-based geolocation snapped to a kecamatan on the device, district-only aggregation on public views, EXIF stripping, rounded public waste-report pins, and labelled demo data.

## 7. Accessibility

- Semantic landmarks, headings, `aria-live` status regions, and labelled inputs; Radix Dialog for focus-trapped modals.
- Keyboard-operable action cards (radio inputs), tabs with `role="tab"`/`aria-selected`, and pressed states on toggle buttons.
- An accessible table alternative for both maps, sortable by metric.
- `gray-400` is darkened to #6B7280 for AA text contrast.
- `prefers-reduced-motion` is respected for CSS animations and Framer Motion (`MotionConfig reducedMotion="user"`).

## 8. Performance

- Leaflet maps are loaded with `next/dynamic({ ssr: false })` only on pages that use them. Recharts loads only on the tracker, step tracker and government pages.
- The duplicate Google Fonts `@import` was removed (the font is self-hosted with `next/font`).
- Photos are compressed on the client before upload (≤ 1600 px JPEG).
- First Load JS: landing page 145 kB (was 200 kB); dashboard 162 kB (was 247 kB).

## 9. Testing

| Check | Command | Result at time of writing |
|---|---|---|
| Lint | `npm run lint` | no warnings or errors |
| Types | `npm run typecheck` | pass |
| Build | `npm run build` | pass, 20 routes |
| API & routing smoke test | `npm run test:smoke` (server running) | 42/42 pass (demo mode) |

The full user journey (demo login → verify → EcoPoints → community share → redeem → map → waste report → tracker/OCR → step tracker → profile → government portal → logout) was also run in headless Chromium at 390 px and 1366 px widths with no console errors or horizontal overflow. That browser script was a development aid and is not included in the repository.

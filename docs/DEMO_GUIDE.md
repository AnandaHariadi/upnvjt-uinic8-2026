# PACUL judge demo guide

About 5 minutes. Works on phone or desktop, with no API keys and no backend. Everything shown in demo mode is labelled *Demo*, *Simulated* or *Prototype*.

## Start

1. Open the site and select **Explore Demo** (or go to `/demo`).
   This signs in as `demo@pacul.app` and **resets the demo to the same seeded state every time**: 500 EcoPoints, two seeded history records, one joined challenge at 2/3, ten demo waste reports.
2. The dashboard shows the **Judge demo guide**, which ticks each step automatically.

## 1 · AI-assisted verification

`Verify Green Action`

1. Keep **Waste Sorting** selected (or choose another action).
2. **Take photo** (mobile camera) or **Choose from gallery**. Use any real photo, and a new file each time.
3. Select **Verify my action**.

What you see:

- The status chip at the top of the card says **Demo mode: results are simulated** (no Vision key) or **Live AI: Google Cloud Vision**.
- The result: **Demo Verified** (demo) or **Verified / Needs Review / Rejected** (live), with the reason, any safeguard flags, the estimated impact and EcoPoints.
- In live mode, the "model-reported label score" is shown with a note that it is not a measured accuracy.

To see the safeguards, select **Verify another action** and submit the **same photo** again: the upload is blocked as a duplicate. Wait less than 60 seconds between submissions to see the interval rule.

## 2 · EcoPoints

After a verified waste-sorting action: **+40 EcoPoints**, and the *Sort-at-Home Week* challenge completes (**+100**). The balance updates in the sidebar, on the dashboard KPI and in *EcoPoints history* in the marketplace. Badges update on the EcoAction and Profile pages.

## 3 · Bursa Pasar Hijau

`Bursa Pasar Hijau` → **Redeem** on any reward → **Redeem for …** → **Confirm** → QR voucher. Open *My vouchers* to see the voucher, and use *Simulate merchant scan* to mark it as used. Merchants are fictional demo UMKM.

## 4 · Surabaya Local Impact Map

`Local Impact Map` → switch metrics (actions, waste reports, CO₂e, contributors, EcoPoints, UMKM) → select **Wonokromo** in the table or on the map. The panel notes that it includes your verified action. The district baseline is a synthetic demo dataset.

## 5 · Citizen Waste Report (optional)

`Citizen Waste Report` → **New report** → use your location or tap the map → category and severity → photo → submit. The report appears in the government portal.

## 6 · Government analytics

`/gov/login` → **Continue as Demo Officer** (`gov-demo@pacul.app` / `GovDemo1234!`).
Explore the Overview, **Environmental Reports** (select **Manage** → set *Resolved* with a note → save), Green Action Analytics, Spatial Intelligence, Community Participation and EcoPoints & Economy. Use **District CSV** / **Export CSV** to download data.

## Reset

Use **Explore Demo** again at any time to restore the seeded state.

## Live AI mode (optional)

Set `GOOGLE_VISION_API_KEY` (server-side) and restart. The verification card then reports **Live AI**, and results depend on the image content (e.g. a photo of a bicycle submitted as *Waste Sorting* is rejected with a suggested action). Set `AI_VERIFICATION_MODE=demo` to force deterministic demo results.

# PACUL — Platform Aksi Komunitas Untuk Lingkungan

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![GAYATAMA 5](https://img.shields.io/badge/GAYATAMA_5-2026-2D5F3F?style=for-the-badge)](https://gayatama.unesa.ac.id/)

**A Surabaya-first community environmental platform turning verified green actions into measurable impact, EcoPoints, and local UMKM rewards.**

[Explore Live Demo](#-demo-flow--quick-access) • [Installation Guide](#-installation-guide) • [Technology Information](#-technology-information--architecture) • [Technical Documentation](#-technical-documentation)

</div>

---

## 📋 Repository Compliance Checklist

This repository satisfies all requirements for the **GAYATAMA 5 2026 International Web Technology Competition**:

| Requirement | Implementation & Location |
|---|---|
| **Source Code** | Full production-ready Next.js 14 App Router codebase in [`src/`](src/) and [`public/`](public/) |
| **README & Overviews** | Comprehensive documentation in [`README.md`](README.md), [`frontend/README.md`](frontend/README.md), and [`backend/README.md`](backend/README.md) |
| **Product Specifications** | Complete Product Requirements Document in [`PRD.md`](PRD.md) and [`Project_Update.md`](Project_Update.md) |
| **Architecture & Systems** | End-to-end architecture in [`system.md`](system.md) and [`docs/TECHNICAL.md`](docs/TECHNICAL.md) |
| **Frontend Flow & Contracts** | User journey state machines and store contracts in [`frontend-flow-contract.md`](frontend-flow-contract.md) |
| **Agent Operating Manual** | AI agent playbook and analytical guidelines in [`AGENTS.md`](AGENTS.md) |
| **Installation Guide** | Step-by-step setup, prerequisites, environment configuration, and verification commands in [Installation Guide](#-installation-guide) |
| **Technical Documentation** | Dedicated domain specifications: [`docs/TECHNICAL.md`](docs/TECHNICAL.md), [`docs/IMPACT_METHODOLOGY.md`](docs/IMPACT_METHODOLOGY.md), and [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) |

---

## 📑 Table of Contents

- [Team & Competition Context](#-team--competition-context)
- [Project Overview & Core Solution](#-project-overview--core-solution)
- [Key Features Breakdown](#-key-features-breakdown)
- [Technology Information & Architecture](#-technology-information--architecture)
  - [System Architecture Diagram](#system-architecture-diagram)
  - [Full Technology Stack Table](#full-technology-stack-table)
  - [AI & Vision OCR Integration](#ai--vision-ocr-integration)
  - [PWA & Offline System](#pwa--offline-system)
  - [Security & Privacy Controls](#security--privacy-controls)
- [Installation Guide](#-installation-guide)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Installation](#step-by-step-installation)
  - [Environment Variables](#environment-variables)
  - [Running Development Server](#running-development-server)
  - [Production Build & Deployment](#production-build--deployment)
  - [Automated Smoke Tests](#automated-smoke-tests)
- [Technical Documentation Index](#-technical-documentation)
- [EcoPoints & Bursa Pasar Hijau](#-ecopoints--bursa-pasar-hijau)
- [Surabaya Local Impact Map](#-surabaya-local-impact-map)
- [Government Portal](#-government-portal)
- [Demo Flow & Quick Access](#-demo-flow--quick-access)
- [Known Limitations & Roadmap](#-known-limitations--roadmap)
- [License & Attribution](#-license--attribution)

---

## 👥 Team & Competition Context

| Attribute | Details |
|---|---|
| **Team Name** | Kalau Juara Nyebur Danau UNESA |
| **Institution** | Universitas Pembangunan Nasional "Veteran" Jawa Timur |
| **Team Members** | **Galih Aji Pangestu** · **Stevyka Frista Aninda** · **Putri Ayu Ajeng Nina Zuraida** |
| **Competition** | **GAYATAMA 5 2026** — International Web Technology Competition |
| **Theme** | *"Innovating for a Sustainable Future: Empowering Communities through Web Technology"* |
| **Primary Subthemes** | **Environment**, **Smart Communities**, **Economic Empowerment** |
| **Secondary Subthemes**| **Public Services**, **Social Development** |

### SDG Alignment

PACUL directly contributes to four Sustainable Development Goals:
- **SDG 11 (Sustainable Cities and Communities)**: Crowdsourced waste hotspot reporting and district-level geospatial environmental monitoring across Surabaya.
- **SDG 12 (Responsible Consumption and Production)**: Verified domestic waste sorting at source and used cooking oil (*jelantah*) collection.
- **SDG 13 (Climate Action)**: Quantified carbon avoidance from household energy efficiency, active mobility, and tree planting.
- **SDG 7 (Affordable and Clean Energy)**: OCR electricity receipt scanning, PLN tariff tier benchmarking, and energy reduction incentives.

---

## 💡 Project Overview & Core Solution

Modern urban environmental initiatives often suffer from **lack of feedback loops**: individual actions feel invisible, campaigns fade after one-off events, household waste is mixed without sorting, and municipal authorities lack neighbourhood-level spatial telemetry.

PACUL closes this loop with a cohesive, privacy-aware digital ecosystem:

```
[ Citizen Green Action ] ──► [ AI & Vision Verification ] ──► [ EcoPoints Awarded ]
                                                                       │
                                                                       ▼
[ Smarter Municipal Decisions ] ◄── [ Surabaya Impact Map ] ◄── [ Bursa Pasar Hijau (UMKM) ]
```

1. **AI-Assisted Verification**: Citizens upload evidence photos which are validated on the server using Google Cloud Vision label detection combined with PACUL's contextual heuristic rule engine.
2. **EcoPoints Incentive Engine**: Transparent rewards awarded strictly for verified green actions, driving healthy competition through levels, badges, and streaks.
3. **Bursa Pasar Hijau**: EcoPoints are directly redeemable for digital vouchers with QR codes at local Surabaya micro, small, and medium enterprises (UMKM), circulating economic value locally.
4. **Surabaya Local Impact Map**: Real-time aggregation of citizen green actions, waste reports, and carbon offsets across all 31 subdistricts (*kecamatan*).
5. **Government Decision-Support Portal**: An administrative analytics interface for Dinas Lingkungan Hidup (DLH) officers to triage citizen waste reports, evaluate spatial hotspots, and download audit-ready CSV reports.

---

## ✨ Key Features Breakdown

### Citizen Experience (`/dashboard/*`)

| Feature | Route | Description |
|---|---|---|
| **Green Action Verifier** | [`/dashboard/eco-action`](src/app/dashboard/eco-action/page.tsx) | AI camera capture, real-time evidence evaluation, challenge progress, and achievement badges. |
| **Carbon Tracker & PLN OCR** | [`/dashboard/tracker`](src/app/dashboard/tracker/page.tsx) | Household energy footprint logging, PLN bill OCR scanning, category breakdowns, and weekly trends. |
| **Bursa Pasar Hijau** | [`/dashboard/marketplace`](src/app/dashboard/marketplace/page.tsx) | Catalogue of local UMKM rewards, voucher claim/redemption dialogs, and dynamic QR code passes. |
| **Surabaya Impact Map** | [`/dashboard/map`](src/app/dashboard/map/page.tsx) | Interactive SVG & Leaflet map drilldown across 31 subdistricts with accessible ranking data tables. |
| **Citizen Waste Report** | [`/dashboard/laporan-sampah`](src/app/dashboard/laporan-sampah/page.tsx) | Interactive waste mapping, severity classification, status timelines, and photo upload. |
| **Community Action Network**| [`/dashboard/collaboration`](src/app/dashboard/collaboration/page.tsx) | Collaborative feed distinguishing **Verified Actions** from general community discussions. |
| **Low-Carbon Step Tracker** | [`/dashboard/step-tracker`](src/app/dashboard/step-tracker/page.tsx) | Sensor-based pedometer calculating walking carbon offsets against baseline motorcycle trips. |
| **User Profile & Badges** | [`/dashboard/profile`](src/app/dashboard/profile/page.tsx) | Eco-level progression, unlocked trophies, personal statistics, and push notification settings. |

### Government & Public Service (`/gov/*`)

| Feature | Route | Description |
|---|---|---|
| **Executive Overview** | [`/gov/dashboard`](src/app/gov/dashboard/page.tsx) | City-wide KPIs, priority districts requiring intervention, and environmental metrics. |
| **Waste Report Dispatch** | `/gov/dashboard` | Search, filter, status transition (Received → Verified → In Progress → Resolved), and notes. |
| **Spatial Intelligence** | `/gov/dashboard` | Sub-district heatmaps and responder view with exact GPS coordinates for municipal cleanup crews. |
| **Audit CSV Export** | `/gov/dashboard` | Formula-injection-safe CSV export for district statistics and detailed incident logs. |

---

## 🛠️ Technology Information & Architecture

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Layer (Browser / PWA)                    │
│                                                                        │
│   Next.js 14 App Router  •  React 18  •  Tailwind CSS  •  Framer Motion │
│   Zustand LocalStorage Persistence  •  TanStack Query  •  Workbox PWA  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS Request (API / Pages)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Middleware & Routing Layer (middleware.ts)               │
│                                                                        │
│       Role Gating (Citizen Cookies vs. Government Admin Cookies)       │
│       Security Headers, Strict CSP & Rate Limiting Enforcement         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│   Client Feature Modules        │   │    Server-Side Route Handlers    │
│                                 │   │        (Node.js Runtime)         │
│ • Local Impact Map (Leaflet)    │   │                                  │
│ • Bursa Pasar Hijau (Zustand)   │   │ • POST /api/eco-action/verify    │
│ • Carbon & Step Tracker         │   │   - Magic bytes / MIME check     │
│ • Waste Report Management       │   │   - EXIF / Image sanitization    │
│ • District Aggregation Pipeline │   │   - SHA-256 duplicate cache      │
│   (src/lib/impact-aggregation)  │   │   - Heuristic evaluation engine  │
└─────────────────────────────────┘   │ • POST /api/ocr/scan-bill        │
                                      │   - PLN bill parser & validation │
                                      └────────────────┬─────────────────┘
                                                       │ REST API (HTTPS)
                                                       ▼
                                      ┌──────────────────────────────────┐
                                      │  Google Cloud Vision API (Live)  │
                                      │  Deterministic Fallback (Demo)   │
                                      └──────────────────────────────────┘
```

### Full Technology Stack Table

Verified against [`package.json`](package.json):

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Core Framework** | **Next.js** | `14.2.3` | React Framework with App Router, Server Components, Route Handlers, and Image Optimization |
| **UI Library** | **React** / **React DOM** | `18.3.1` | Core declarative component rendering engine |
| **Language** | **TypeScript** | `5.4.5` | Strict static typing across models, API contracts, and stores |
| **Styling & CSS** | **Tailwind CSS** | `3.4.3` | Utility-first CSS framework with custom design tokens and dark mode support |
| **Typography** | **Plus Jakarta Sans** | `next/font` | Self-hosted Google Font optimized without external network roundtrips |
| **Animations** | **Framer Motion** | `11.2.4` | Physics-based spring transitions, layout animations, and modal state transitions |
| **UI Primitives** | **Radix UI Dialog** | `1.0.5` | WAI-ARIA accessible modal dialogs and alert primitives |
| **Icons** | **Lucide React** | `0.383.0` | Comprehensive, consistent icon system |
| **State Management**| **Zustand** | `4.5.2` | Lightweight state store with `persist` middleware backed by `localStorage` |
| **Data Fetching** | **TanStack Query** | `5.39.0` | Server state synchronization, caching, and background revalidation |
| **Form Validation** | **React Hook Form** + **Zod** | `7.51.5` / `3.23.8` | Performant uncontrolled forms with strictly typed schema validation |
| **Geospatial Maps** | **Leaflet** / **React-Leaflet** | `1.9.4` / `4.2.1` | Interactive vector map visualization with OpenStreetMap tiles (no API key required) |
| **Data Visualization**| **Recharts** | `2.12.7` | SVG-based responsive emission trends and district comparison charts |
| **PWA & Offline** | **next-pwa** (Workbox) | `5.6.0` | Service Worker generation, asset precaching, and offline capability |
| **AI / Vision OCR** | **Google Cloud Vision REST API** | v1 | Server-side label detection, SafeSearch filtering, and text extraction |
| **Notifications** | **Sonner** | `2.0.7` | Lightweight, stackable toast notifications |
| **Utilities** | **clsx** & **tailwind-merge** | `2.1.1` / `2.3.0` | Conflict-free conditional className resolution |

### AI & Vision OCR Integration

PACUL includes a server-side AI pipeline for automated green action validation:
- **Route**: `POST /api/eco-action/verify`
- **Client Preprocessing**: Images are scaled to a maximum of 1600px JPEG on an HTML canvas, stripping private EXIF metadata and GPS coordinates before transmission.
- **Server Safeguards**: Magic byte verification prevents disguised executable uploads; image dimensions (≥ 320px) and file size (≤ 5MB) are strictly validated.
- **Deduplication Engine**: Calculates SHA-256 digests against recent submissions to prevent duplicate reward farming.
- **Evaluation Rules**: Analyzes Google Cloud Vision labels against defined semantic dictionaries in [`src/lib/verification/evaluate.ts`](src/lib/verification/evaluate.ts). Differentiates between primary action matches, cross-category mismatches (e.g. submitting a bicycle photo for waste sorting), screenshots, and invalid submissions.
- **Deterministic Demo Fallback**: When running without an API key, the system seamlessly uses mock evaluation logic marked clearly with `Demo Verified`, ensuring the app remains 100% testable in any environment.

### PWA & Offline System

- **Manifest**: [`public/manifest.json`](public/manifest.json) defines standalone display mode, orientation, branding colors (`#2D5F3F`), and App Shortcuts.
- **Service Worker**: Caches Next.js static bundles, fonts, icons, and OpenStreetMap tiles using a `CacheFirst` strategy with LRU expiration.
- **Web Push Ready**: Handlers in [`public/sw-push.js`](public/sw-push.js) manage background push events and notification clicks.

### Security & Privacy Controls

1. **Zero Database Footprint in Demo**: All state resides locally in the tester's browser storage; no citizen personal data is stored on remote servers.
2. **Location Privacy**: Citizen coordinates for green actions are snapped to subdistrict (*kecamatan*) centroids on-device. Waste report coordinates are fuzzed to ~100m on citizen maps, only exposed at precision in the authenticated responder view.
3. **Hardened HTTP Headers**: Implemented in [`next.config.js`](next.config.js):
   - Strict Content Security Policy (`CSP`)
   - `X-Frame-Options: DENY` & `frame-ancestors 'none'`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - Restrictive `Permissions-Policy` (camera & geolocation limited to self)
4. **CSV Injection Prevention**: Government exports prepend a single quote (`'`) to any cell starting with `=`, `+`, `-`, or `@` to neutralize spreadsheet macro execution.

---

## 🚀 Installation Guide

### Prerequisites

Ensure you have the following installed on your development machine:
- **Node.js**: Version `18.17.0` or higher (tested with Node 18, Node 20, and Node 26)
- **npm**: Version `9.0.0` or higher (or equivalent `pnpm` / `yarn`)
- **Git**: For repository version control

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/galiihajiip/pacul-gayatama.git
cd pacul-gayatama

# 2. Install dependencies
npm install

# 3. Setup environment variables (optional for demo mode)
cp .env.example .env.local
```

### Environment Variables

PACUL works out-of-the-box in **Demo Mode** without requiring any external API keys. To configure optional live cloud services, adjust `.env.local`:

| Variable | Target | Default | Description |
|---|---|---|---|
| `GOOGLE_VISION_API_KEY` | Server | *None* | Google Cloud Vision API key for live AI label and OCR text detection. |
| `AI_VERIFICATION_MODE` | Server | `auto` | Set to `auto` (uses key if present), `live` (forces API), or `demo` (deterministic mock). |
| `NEXT_PUBLIC_DEMO_MODE` | Client | `true` | When `true`, stores state in browser `localStorage`. When `false`, connects to backend. |
| `NEXT_PUBLIC_SITE_URL` | Client | `http://localhost:3000` | Canonical site URL used for Open Graph and metadata generation. |
| `NEXT_PUBLIC_MAP_TILE_URL` | Client | *OpenStreetMap* | Custom tile server URL template for map rendering. |
| `NEXT_PUBLIC_API_URL` | Client | `http://localhost:8000/api` | Optional REST backend endpoint URL. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Client | *None* | Web Push VAPID public key for browser push notification registration. |

### Running Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app runs with hot module reloading enabled.

### Production Build & Deployment

To validate that the application builds and bundles cleanly for production:

```bash
# Compile and optimize production bundle
npm run build

# Start production server
npm run start
```

### Automated Smoke Tests

PACUL includes an end-to-end automated smoke testing suite that verifies routes, security headers, role redirects, and API contracts:

```bash
# In a separate terminal while the server is running:
npm run test:smoke
```

Test validations performed:
- Root and public routes return HTTP 200
- Middleware redirects unauthorized access to `/login` and `/gov/login`
- Security response headers (`CSP`, `nosniff`, `frame-ancestors`) are properly set
- `POST /api/eco-action/verify` rejects invalid payloads, oversized files, and unsupported formats
- Verification logic returns deterministic status in demo mode

---

## 📚 Technical Documentation

Deep-dive documentation for judges, evaluators, and system architects:

| Document | Focus Area |
|---|---|
| 📘 [`docs/TECHNICAL.md`](docs/TECHNICAL.md) | Architectural specifications, state machines, store schemas, complete API specifications, rate limiting, and production scaling roadmap. |
| 📊 [`docs/IMPACT_METHODOLOGY.md`](docs/IMPACT_METHODOLOGY.md) | Official conversion formulas, emission factor sources (ESDM, UK DESNZ), self-reported vs. measured data, and EcoPoints reward rules. |
| 🎯 [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) | 5-minute step-by-step judge presentation script covering every feature and safeguard. |

---

## 🪙 EcoPoints & Bursa Pasar Hijau

EcoPoints are strictly in-app gamification credits that reward positive environmental behaviors. They cannot be converted to fiat currency or cryptocurrency.

### Primary Action Reward Rates

| Green Action | Evidence Required | Metric Measured | EcoPoints | Daily Limit |
|---|---|---|---|---|
| **Waste Sorting** | Organic / inorganic bags separated | kg sorted (self-reported, max 10 kg) | **40** | 2 / day |
| **Used Cooking Oil** | Sealed bottle / jerrycan of *jelantah* | Litres collected (max 5 L) | **50** | 1 / day |
| **Tree Planting** | Newly planted tree seedling in soil | Trees planted (max 10) | **80** | 2 / day |
| **Energy Saving** | kWh token screen or LED conversion | Estimated kWh saved | **40** | 1 / day |
| **Sustainable Travel** | Public transport / bicycle / walking | Trip distance (km) | **30** | 3 / day |

*Rewards are flat-rate per verified action rather than scaled by self-reported quantities to prevent fraudulent over-reporting.*

### Bursa Pasar Hijau (Local UMKM Catalog)

EcoPoints can be exchanged for vouchers from participating local Surabaya businesses:
- **Mitra UMKM**: Fictional demo partners representing eco-friendly businesses across Surabaya (e.g. *Warung Bu Kris Rungkut*, *Kopi Sahabat Rungkut*, *Toko Kelontong Berkah Wonokromo*).
- **Voucher Features**: Dynamic QR codes, unique verification serials, expiration countdowns, and merchant-side redemption simulation.

---

## 🗺️ Surabaya Local Impact Map

- **Coverage**: All 31 subdistricts (*kecamatan*) across West, Central, North, East, and South Surabaya.
- **Visual Layer**: Lightweight SVG map and responsive Leaflet tile engine showing district color coding based on active citizen contributions.
- **Privacy Assurance**: Public map markers never display exact citizen home addresses; contributions are aggregated to the district centroid.

---

## 🏛️ Government Portal

Accessible at `/gov/login`:
- **Role**: Designed for Dinas Lingkungan Hidup (DLH) Kota Surabaya environmental coordinators.
- **Capabilities**:
  - Triage citizen waste reports with photos and precise incident coordinates
  - Update progress statuses and publish verified resolution notes back to citizen timelines
  - Monitor city-wide carbon reduction and tree planting progress
  - Export audit datasets in sanitized CSV format

---

## 🎯 Demo Flow & Quick Access

For evaluators and judges reviewing the platform:

1. **One-Click Demo Access**: Visit `/` and click **"Explore Demo"** (or navigate directly to [`/demo`](src/app/demo/page.tsx)).
   - Automatically initializes a pre-configured account with 500 EcoPoints, active challenges, and sample history.
2. **Evaluation Credentials**:
   - **Citizen Demo**: `demo@pacul.app` / `Demo1234!`
   - **Government Officer Demo**: `gov-demo@pacul.app` / `GovDemo1234!`
3. **Interactive Judge Guide**: The citizen dashboard displays an interactive checklist that automatically marks items as completed as you test each feature.

---

## ⚠️ Known Limitations & Roadmap

### Prototype Scope
- **Client Persistence**: In this demo release, data persistence is maintained per-browser via `localStorage`.
- **Estimated Impacts**: Environmental impact figures represent standardized engineering estimates based on ESDM and DESNZ coefficients.
- **Simulated Partnerships**: UMKM partners and government integration are demonstration models illustrating the closed-loop circular economy.

### Future Roadmap
- **Phase 1**: Production relational database integration (PostgreSQL + PostGIS), secure JWT authentication, and administrative review portal for flagged actions.
- **Phase 2**: Formal merchant portal with mobile camera barcode scanning for instant voucher validation at UMKM cash registers.
- **Phase 3**: IoT smart-meter integration with PLN API for automated household electricity validation.
- **Phase 4**: Expansion beyond Surabaya to other major Indonesian metropolitan areas.

---

## 📄 License & Attribution

© 2026 **Kalau Juara Nyebur Danau UNESA** — Universitas Pembangunan Nasional "Veteran" Jawa Timur. All rights reserved.

- Map data © [OpenStreetMap](https://www.openstreetmap.org/) contributors under ODbL.
- Landing page background video: *Man planting a small seedling in a garden bed* from [Mixkit](https://mixkit.co/), used under the free Mixkit License.
- Icons by [Lucide](https://lucide.dev/) under the ISC License.

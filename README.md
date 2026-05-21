<div align="center">
  <img width="1200" height="475" alt="QR Code Leaf Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center">QR Code Leaf</h1>

<p align="center">
  <strong>A full-featured QR code designer with campaign analytics, brand-aware auto-coloring, and a template marketplace — all built with React and Express.</strong>
</p>

<p align="center">
  <a href="#what-it-does">What It Does</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#api-reference">API Reference</a>
</p>

---

## What It Does

QR Code Leaf is a web app for designing, exporting, and tracking QR codes. It goes beyond a basic generator — you get fine-grained control over how your QR looks, real-time analytics when people scan it, and a template system to keep your designs consistent.

You can encode four types of content into a QR code:

- **URL** — any link, with auto-redirect and scan tracking built in
- **Plain Text** — embed text directly; no internet needed to read it
- **WiFi Network** — generate codes that join people to your network on scan (WPA, WEP, open)
- **vCard Contact** — share name, phone, and email as a digital business card

## How It Works

### Design

The generator gives you a live preview on a zoomable artboard that updates as you tweak settings. The left sidebar handles the data source and technical specs (error correction level, QR version, quiet zone padding), while the right sidebar controls all the visual design.

There are 7 dot patterns — square, rounded, dots, liquid, constellation, crystal, and columns — and 10 finder styles including circular, bullseye, orbital, diamond, leaf, and shield. You can color the QR with a solid fill, a linear or radial gradient, or let the app auto-pick colors by extracting a website's brand palette from its logo.

Logo overlays, custom text labels, and watermark options are all handled on the backend using canvas rendering with sharp for upscaling. The export supports PNG up to 2048×2048, lossless SVG, and clipboard copy for pasting into Figma or Canva.

### Auto-Color (AI Feature)

When you enter a URL, the backend fetches the site's logo, runs it through node-vibrant to extract dominant colors, then optionally enhances the palette using Gemini API for a more accurate brand match. The extracted colors auto-populate the QR's foreground and gradient, so you get a code that matches the brand without manual tweaking.

### Analytics & Scan Tracking

Every QR code generated from a URL gets a unique campaign ID stored in SQLite. The QR encodes a redirect through `/scan/:id` — when someone scans it, the backend logs their IP, user agent, and timestamp before redirecting to the destination. The dashboard then shows daily traffic charts, unique visitor counts, readability scores, and per-campaign breakdowns. All of this pulls from real data in the database, not simulated numbers.

### Templates

There's a built-in template marketplace with 13+ pre-designed styles you can apply with one click. Templates can also be pushed from the backend by an admin user, and they merge with the static template set at runtime without duplication.

### Auth

Login and signup use JWT tokens with a SQLite-backed user store. Admin users can push new templates through a protected endpoint.

## Tech Stack

| Layer | What It Uses |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Motion, React Router v7 |
| Backend | Express.js, TypeScript, tsx (watch mode for dev) |
| Database | SQLite via better-sqlite3 |
| QR Engines | qrcode (server-side generation), qrcode.react (client-side preview), @zxing/library (scan validation) |
| AI Integration | Google Gemini API (@google/genai) for color enhancement |
| Image Processing | node-canvas, sharp (upscaling), node-vibrant (color extraction) |
| Auth | jsonwebtoken |
| Charts | Recharts |
| HTML Parsing | cheerio, jsdom (logo extraction from websites) |

## Getting Started

**You'll need:** Node.js 18 or later, and a Gemini API key if you want the AI auto-color feature (everything else works without it).

```bash
# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd ../backend && npm install

# Set up your environment variables
# Copy .env.example to .env.local and fill in your values
```

Then start both servers in separate terminals:

```bash
# Terminal 1 — Backend (runs on port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (runs on port 3000)
cd frontend && npm run dev
```

Open `http://localhost:3000` in your browser. The frontend dev server proxies API requests to the backend.

## Project Structure

```
qrcode leaf/
├── frontend/                        # React SPA
│   ├── src/
│   │   ├── views/                   # One file per page
│   │   │   ├── LandingView.tsx      Marketing landing page with feature highlights
│   │   │   ├── GeneratorView.tsx    The main QR designer — sidebar, canvas, toolbar
│   │   │   ├── TemplatesView.tsx    Browse and apply design templates
│   │   │   ├── DashboardView.tsx    Campaign analytics with charts and tables
│   │   │   ├── PricingView.tsx      Pricing page
│   │   │   ├── DocsView.tsx         Documentation page
│   │   │   ├── LoginView.tsx        Login form
│   │   │   └── SignupView.tsx       Registration form
│   │   ├── components/
│   │   │   ├── layout/              AppLayout, PublicLayout (shared shells)
│   │   │   └── ui/                  Reusable components — Button, Card, etc.
│   │   ├── lib/utils.ts             cn() helper for conditional class merging
│   │   ├── types.ts                 Campaign, QRConfig, Template interfaces
│   │   ├── TemplateContext.tsx       React context for template state + API fetch
│   │   ├── mockData.ts              Fallback data for when the API isn't running
│   │   ├── templateMetadata.ts      Static template definitions
│   │   └── App.tsx                  Route definitions with lazy-loaded views
│   ├── public/                      Static assets including icons
│   └── package.json
│
├── backend/                         # Express API
│   ├── src/
│   │   ├── qr/
│   │   │   ├── generator.ts        Core QR rendering — applies colors, patterns, finder styles, logos
│   │   │   ├── export.ts           PNG/SVG generation, transparent backgrounds, high-res upscale
│   │   │   └── validator.ts        Checks if a generated QR is actually scannable
│   │   ├── logo/
│   │   │   └── fetcher.ts          Fetches website logos — tries favicon, Google S2, Open Graph
│   │   ├── colors/
│   │   │   └── extractor.ts        Extracts dominant colors via node-vibrant, enhances with Gemini
│   │   ├── templet/                Template push (admin) and list endpoints
│   │   ├── api.ts                  Request handler for POST /api/generate
│   │   ├── auth.ts                 JWT login, registration, and admin middleware
│   │   ├── analyticsStore.ts       Reads/writes scan data to SQLite, computes dashboard stats
│   │   ├── db.ts                   SQLite connection setup and schema initialization
│   │   ├── types.ts                Shared types — BrandColors, QRStyleOptions, QRGenerateResult
│   │   └── utils.ts                URL normalization, brand name extraction, ID generation
│   ├── server.ts                   Express app — routes, CORS, middleware
│   └── package.json
│
├── .env.example                    Template for required environment variables
├── metadata.json                   App metadata used by deployment platforms
├── test-api.mjs                    Quick API smoke test
└── README.md
```

## API Reference

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | `/api/generate` | Generate a QR code with all style options. Accepts URL, colors, patterns, logo, template, etc. Returns PNG and SVG data URLs along with scan validation results. |
| GET | `/api/templates` | List all available templates (static + admin-pushed) |
| POST | `/api/templates/push` | Push a new template to the database. Requires admin JWT. |
| POST | `/api/auth/login` | Sign in with email and password. Returns a JWT. |
| POST | `/api/auth/register` | Create a new user account. |
| GET | `/api/analytics` | Returns aggregate stats — total scans, unique visitors, daily traffic, per-campaign breakdowns |
| GET | `/scan/:id` | Redirect endpoint encoded in QR codes. Logs the scan before forwarding to the destination URL. |
| GET | `/api/health` | Returns `{ status: "ok" }` for uptime checks |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `APP_URL` | The URL where the app is hosted. Used for self-referential links and API callbacks. Automatically set by deployment platforms. |
| `JWT_SECRET` | Secret key for signing JWTs. Falls back to a dev default if not set. |
| `PORT` | Port for the backend server. Defaults to 3001. |

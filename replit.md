# Workspace — CB: NYC Civic Narrative Agent

## Overview

CB is a civic narrative agent that synthesizes spatial, financial, and historical data into a single interleaved story of any NYC block. Click a location on the map, CB generates the full picture — property history, mortgage denial rates, pandemic relief gaps, and archival photos — woven into one coherent narrative by Gemini AI.

Built at the Google NYC Hackathon, 2026.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite + Tailwind CSS
- **Map**: Leaflet + OpenStreetMap
- **Charts**: Recharts
- **AI Narrative**: Gemini 2.5 Flash via Replit AI Integrations

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── cb-app/             # React + Vite frontend (CB app)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-gemini-ai/  # Gemini AI integration client
└── scripts/                # Utility scripts
```

## Key Architecture

### Data Sources
- **NYC PLUTO** (NYC Open Data): Property data by coordinates/BBL — year built, land use, zoning
- **LPC Landmarks** (NYC Open Data): Landmark designation data by location
- **HMDA Mortgage Data**: Embedded static data by zip code (2023) with city averages
- **SBA PPP Loan Data**: Embedded static data by zip code (2020-2021)
- **OldNYC / NYPL Milstein Collection**: Archival photos by lat/lng

### Backend Route Flow
```
POST /api/narrative { lat, lng }
  → geocodeLatLng() — Planning Labs API → Nominatim fallback
  → fetchPropertyData() — PLUTO via NYC Open Data
  → fetchLandmarkData() — LPC via NYC Open Data
  → getMortgageData() — static HMDA data by zip
  → getPPPData() — static PPP data by zip
  → fetchArchivalPhotos() — OldNYC API
  → generateCivicNarrative() — Gemini 2.5 Flash synthesis
  → returns NarrativeResponse with interleaved markdown
```

### Narrative Format
Gemini produces interleaved markdown with special markers:
- `[PHOTO: YEAR]` → renders matching archival photo from OldNYC
- `[CHART: mortgage_denial]` → renders Recharts bar chart (this zip vs city avg)
- `[CHART: ppp_coverage]` → renders Recharts bar chart (this zip vs city avg)

### Demo Blocks
Pre-optimized for 5 NYC locations:
- East Flatbush, Brooklyn (11203)
- South Bronx (10456)
- Harlem, Manhattan (10037)
- Dumbo, Brooklyn (11201)
- Jackson Heights, Queens (11372)

## API Endpoints
- `POST /api/narrative` — Generate narrative for lat/lng
- `GET /api/narrative/demo-blocks` — Get 5 pre-optimized demo blocks
- `GET /api/healthz` — Health check

## Environment Variables (Auto-provisioned)
- `DATABASE_URL` — PostgreSQL connection
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Gemini API base URL
- `AI_INTEGRATIONS_GEMINI_API_KEY` — Gemini API key
- `PORT` — Server port (auto-assigned)

## Running

- API server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/cb-app run dev`
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB: `pnpm --filter @workspace/db run push`

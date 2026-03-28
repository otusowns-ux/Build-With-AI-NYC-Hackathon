# CB — New York City Block Stories
### Click any block. See the full economic and historical picture.

CB is a civic narrative agent that synthesizes NYC property, mortgage, and pandemic relief data into an interleaved block-level story of any address in the city. We don't just show you what is there. We show you the economic and social forces that made it that way.

Built at the Google NYC Hackathon, 2026.

---

## Built By

**Otuedon Uduaghan** — NYU Tandon School of Engineering, Mechanical Engineering
Google NYC Hackathon, 2026

Solo build. One night of brainstorming. One hackathon.

---

## The Problem

New York City's history is fully documented but completely inaccessible. The data exists to understand why any neighborhood looks the way it does today — who built it, who was pushed out, where the money went, and who got helped when it mattered most. But that data is buried across dozens of incompatible public archives: 100-year-old property records, federal mortgage disclosure filings, pandemic relief databases, and landmark preservation reports that have never been connected.

Right now if you want to understand why a block in East Flatbush looks the way it does — why that corner is vacant, why that building is deteriorating, why that neighborhood never recovered — you need a policy researcher, three hours, and access to eight different government databases.

CB does it in one click.

---

## What It Does Today

- **Click any block in NYC** on an interactive map and get an instant narrative
- **Search any NYC address** — type an address and fly directly to that block
- **Archival photos** from the NYPL Milstein Collection appear inline when available, showing what the block looked like decades ago
- **PPP loan coverage charts** — see how much pandemic relief reached this zip code versus the city average
- **Mortgage denial rate charts** — see lending patterns for this neighborhood compared to the rest of NYC
- **Compare up to 3 locations side by side** — surface disparities between neighborhoods instantly
- **Upload a photo** — Gemini Vision identifies the building and generates the narrative from the image
- **Gemini synthesizes everything** into a single plain-English narrative grounded in verified public data

---

## Data Sources

| Dataset | What It Contributes |
|---|---|
| **NYC PLUTO** (NYC DCP) | Year built, land use, zoning, ownership |
| **LPC Landmarks Database** | Architectural and historical landmark designations |
| **HMDA Mortgage Data** (CFPB) | Mortgage approval and denial rates by neighborhood and race |
| **SBA PPP Loan Data** | Pandemic relief distribution by zip code |
| **NYPL Milstein Collection via OldNYC** | Real archival photographs mapped to NYC street locations |

All data sources are public. No proprietary data. No paywalls. No hallucinated images.

---

## Tech Stack

| Layer | Tool |
|---|---|
| **Map** | Mapbox GL JS |
| **Backend** | Python + FastAPI |
| **AI Narrative** | Gemini 1.5 Pro via Google GenAI SDK |
| **Archival Photos** | OldNYC / NYPL Milstein Collection API |
| **Hosting** | Google Cloud Run |

---

## Demo Blocks

| Block | Why It Matters |
|---|---|
| **East Flatbush, Brooklyn** | Redlined 1940s, Caribbean community, PPP gap |
| **South Bronx, 10456** | Lowest PPP coverage in NYC |
| **Harlem, 10037** | Century of demographic shift and landmark erasure |
| **Dumbo, Brooklyn** | Industrial to luxury conversion |
| **Jackson Heights, Queens** | Immigrant business density, COVID relief disparity |

---

## Roadmap

CB is the first layer. The architecture is designed to grow.

**More data sources** — HOLC redlining map overlays showing 1940s grade designations for every block, NYC eviction records by address, 311 complaint patterns by block, NYC DOB permit history, and property tax assessment trends over time. Each adds a new layer to the story a block can tell.

**Deeper agency** — proactive neighborhood monitoring that surfaces emerging displacement signals without being asked. When eviction filings cluster on a block, when 311 complaints go unanswered, when a building's assessed value jumps 40% in a year — CB flags it.

**Voice interface** — a live audio agent for the bike ride use case. You're cycling through a neighborhood, you ask about what you're passing, CB tells you. The city explains itself as you move through it.

**Community contributions** — users add photos, flag data gaps, and surface stories the datasets don't capture. Over time CB becomes a living archive of NYC's built memory, not just a query tool.

**Displacement risk reports** — a shareable one-page output combining historical, financial, and present-day data for any block. Built for community advocates who need evidence, not anecdotes, when fighting a rezoning or challenging a developer.

Today: a civic narrative agent.
Tomorrow: the city's memory.

# Housing Need

A Vite + React + TypeScript application for visualizing housing demand projections in Ireland. Based on ESRI Report RS190 methodology and Central Bank cohort-based analysis.

## Getting Started

```bash
npm install
npm run dev
```

Then visit http://localhost:5173 to view the app.

## Commands

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `npm install`           | Install dependencies                             |
| `npm run dev`           | Start dev server                                 |
| `npm run build`         | Generate data + type check + production build    |
| `npm run preview`       | Preview production build                         |
| `npm run generate-data` | Regenerate data files from source CSV/JSON       |
| `npm run typecheck`     | Run TypeScript type checking                     |
| `npm run test`          | Run tests                                        |
| `npm run clean`         | Clear generated data files                       |

## Data

Source data lives in `src/data/` (CSV files and JSON configs). The build script (`scripts/generate-data.ts`) transforms these into JSON files in `public/data/` which are fetched at runtime.

Run `npm run generate-data` when source data files change.

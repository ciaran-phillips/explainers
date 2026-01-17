# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Housing Need

A Vite + React + TypeScript application for visualizing and exploring housing demand projections in Ireland. Based on ESRI Report RS190 methodology and Central Bank cohort-based analysis.

## Build and Development Commands

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `npm install`        | Install or reinstall dependencies              |
| `npm run dev`        | Start Vite dev server                          |
| `npm run build`      | Generate data + type check + build for production |
| `npm run preview`    | Preview production build locally               |
| `npm run generate-data` | Regenerate data files from source CSV/JSON  |
| `npm run typecheck`  | Run TypeScript type checking                   |
| `npm run clean`      | Clear generated data files                     |

**Important:** Run `npm run generate-data` when source data files change.

## Project Structure

```
housing-need/
├── index.html                  # Vite entry HTML
├── vite.config.ts              # Vite configuration
├── scripts/
│   └── generate-data.ts        # Build script for data generation
├── public/
│   └── data/                   # Generated JSON files (from build)
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Router and layout
    ├── index.css               # Global styles
    ├── pages/
    │   ├── EsriPage.tsx        # ESRI model calculator
    │   ├── CentralBankPage.tsx # Central Bank cohort projections
    │   └── CombinedPage.tsx    # Combined view
    ├── components/
    │   ├── calculations.ts     # ESRI calculation functions
    │   ├── cohort-calculations.ts  # Cohort-based calculations
    │   ├── DemandChart.tsx     # Main demand chart
    ├── data/
    │   ├── population-types.ts # Population type definitions
    │   ├── headship-types.ts   # Headship rate types
    │   ├── cb-population-transforms.ts # CSV transforms
    │   ├── esri-scenarios.json # ESRI scenario definitions
    │   └── cb-population-projections-all-years.csv  # CSO data
    ├── hooks/
    │   └── useResizeObserver.ts # Responsive width hook
    └── lib/
        └── dataLoader.ts       # Typed data fetching utilities
```

## Pages

- **`/`** and **`/combined`** - Combined view with model toggle
- **`/esri`** - ESRI model housing demand calculator
- **`/central-bank`** - Central Bank cohort-based projections

## Key Concepts

### Housing Demand Formula
```
Annual Housing Demand = Household Growth + Obsolescence
```

### Data Sources
- **Population projections**: CSO M1 (low), M2 (baseline), M3 (high migration) scenarios
- **Headship rates**: Proportion of each age group heading a household
- **Obsolescence**: Annual replacement rate of housing stock (default 0.25%)

### Data Flow
1. Source data: CSV files and JSON configs in `src/data/`
2. Build script: `scripts/generate-data.ts` transforms source data
3. Output: JSON files in `public/data/`
4. Runtime: Pages fetch from `/data/*.json`

## Development Patterns

### Types
New code should be written in TypeScript. Complex types should be named rather than specified inline. Functions returning primitives can use implicit return types; functions returning objects should have typed return values.

### Comments
Simple functions don't need comments. Prioritize readable code. Function comments should be a single line explaining _why_, not documenting parameters (types do that).

### Styling
CSS is in `src/index.css`. Use specific class names rather than nested selectors.

### Charts
Uses `@observablehq/plot` for charting. Components use `useRef` and `useEffect` to mount Plot visualizations.

### State Management
Pages use React `useState` for form inputs and `useMemo` for derived calculations. Data is fetched via `useEffect` on mount.

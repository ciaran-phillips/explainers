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
| `npm run test`       | Run tests                                      |
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
    │   └── HousingProjectionsPage.tsx  # Main page with ESRI/CB toggle
    ├── components/
    │   ├── calculations.ts     # ESRI calculation functions
    │   ├── cohort-calculations.ts  # Cohort-based calculations
    │   ├── DemandChart.tsx     # Main demand chart
    │   ├── Intro.tsx           # Introductory content
    │   └── filters/
    │       ├── RadioGroup.tsx      # Reusable radio button component
    │       ├── EsriFilters.tsx     # ESRI model filter panel
    │       └── CentralBankFilters.tsx  # Central Bank filter panel
    ├── data/
    │   ├── population-types.ts # Population type definitions
    │   ├── headship-types.ts   # Headship rate types
    │   ├── cb-population-transforms.ts # CSV transforms
    │   ├── esri-scenarios.json # ESRI scenario definitions
    │   └── cb-population-projections-all-years.csv  # CSO data
    ├── hooks/
    │   ├── useAsyncData.ts     # Generic async data loading
    │   ├── useEsriData.ts      # Loads ESRI JSON files
    │   ├── useCentralBankData.ts   # Loads Central Bank JSON files
    │   ├── useAnimatedSeries.ts    # Animates chart transitions
    │   └── useResizeObserver.ts    # Responsive width hook
    └── lib/
        ├── dataLoader.ts       # Typed data fetching utilities
        ├── esriTimeSeries.ts   # ESRI data to chart format
        └── centralBankTimeSeries.ts  # CB data to chart format
```

## Routes

- **`/`** - Main page with model toggle (ESRI / Central Bank)
- **`/combined`** - Same as `/` (alias)

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

### Components & Hooks

Keep components simple. It's not terrible for a component to have a lot of markup, but it shouldn't have a lot of stateful logic - where we find we have long useEffect blocks we should extract common hooks. If we have many useState calls, we should look at creating a reducer, or simply having a single large state object.

When building a hook, we should similarly avoid mixing a lot of stateful and non-stateful logic. Keep the stateful logic in the hook, but extract pure functions to handle any data transformation etc.

### Styling
CSS is in `src/index.css`. Use specific class names rather than nested selectors. We have tailwindcss available, so try to use tailwind classes rather than custom CSS. Prioritize extracting common components (Button, Card etc) that directly use tailwind classes, rather than building custom classes - components are a better level of abstraction.

### Charts
Uses `@observablehq/plot` for charting. Components use `useRef` and `useEffect` to mount Plot visualizations.

### State Management
We don't use a state management library, and don't yet have a forms library - useState hooks are enough for now. useMemo can be used for expensive calculations, but our datasets are small, so it's fine to re-derive most things on render for simplicity.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Housing Need

This is an [Observable Framework](https://observablehq.com/framework/) project, used to visualise and explore the amount of housing needed in Ireland in the coming years. Based on ESRI Report RS190 methodology.

## Build and Development Commands

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm install`        | Install or reinstall dependencies        |
| `npm run dev`        | Start local preview server (port 3000)   |
| `npm run build`      | Build static site, generating `./dist`   |
| `npm run deploy`     | Deploy app to Observable                 |
| `npm run clean`      | Clear the local data loader cache        |

**Important:** Run `npm run clean` when data loaders change to clear cached output.

## Project Structure

```
src/
├── index.md                    # Home page - aggregate demand calculator
├── projections.md              # Cohort-based projections page
├── data/
│   ├── scenarios.json          # Scenario definitions and constants
│   ├── population_by_cohort.csv # CSO population projections (M1/M2/M3)
│   ├── population-by-cohort.json.js    # Data loader for CSV
│   ├── population-projections.json.js  # Aggregate population loader
│   ├── headship-rates.json.js          # Aggregate headship rates loader
│   └── headship-rates-by-cohort.json   # Age-specific headship rates
└── components/
    ├── calculations.js         # Core demand calculation functions
    ├── cohort-calculations.js  # Age-cohort-based calculations
    ├── DemandChart.jsx         # Main chart (index page)
    ├── ProjectionChart.jsx     # Projection chart (projections page)
    ├── ProjectionStats.jsx     # Summary statistics component
    ├── CohortBreakdownChart.jsx # Stacked area by age group
    └── ScenarioComparisonTable.jsx # Scenario comparison table
```

## Pages

- **`/`** (index.md) - Housing Demand Calculator with aggregate population data
- **`/projections`** (projections.md) - Cohort-based projections with age-specific headship rates

## Key Concepts

### Housing Demand Formula
```
Annual Housing Demand = Household Growth + Obsolescence
```

### Data Sources
- **Population projections**: CSO M1 (low), M2 (baseline), M3 (high migration) scenarios
- **Headship rates**: Proportion of each age group heading a household
- **Obsolescence**: Annual replacement rate of housing stock (default 0.25%)

## Observable Framework Patterns

### Inputs with Objects
When using `Inputs.radio()` with object arrays, access the selected value via `.value`:
```js
const options = [{value: "M1", label: "Low"}, {value: "M2", label: "Baseline"}];
const input = view(Inputs.radio(options, {value: options[1], format: d => d.label}));
// Use: input.value (not input directly)
```

### Data Loaders
Files ending in `.json.js` are data loaders that run at build time. Output JSON via:
```js
process.stdout.write(JSON.stringify(data));
```

### JSX Components
React components are defined in files using the `.jsx` extension, but are imported with the `.js` extension in markdown. This is because they are automatically transpiled to .js at build time, and these imports are executed at runtime Remember that to use jsx in markdown you also need to use a jsx code block rather than a js block. Example:

```jsx
import { MyComponent } from "./components/MyComponent.jsx";
display(<MyComponent prop={value} />)
```


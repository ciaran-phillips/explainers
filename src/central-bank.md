---
toc: false
---

# Housing Demand Projections

An interactive tool to explore Ireland's projected housing demand from 2022 to 2057, using age-cohort-based population projections and headship rates.

```js
// Import calculation functions
import {
  CONSTANTS,
  generateCohortTimeSeries,
  generateAllCohortScenarios,
  getScenarioRange
} from "./components/cohort-calculations.js";

// Import React components
import { DemandChart } from "./components/DemandChart.js";

// Import Plot for charts
import * as Plot from "npm:@observablehq/plot";
```

```js
// Load data
const populationByCohort = await FileAttachment("data/cb-population-by-cohort.json").json();
const headshipRates = await FileAttachment("data/cb-headship-rates-by-cohort.json").json();
```

```js
// Pre-calculate all scenarios for range display
const allScenarios = generateAllCohortScenarios(
  populationByCohort,
  headshipRates.current.rates,
  headshipRates.uk_convergence.rates,
  CONSTANTS.DEFAULT_OBSOLESCENCE,
  CONSTANTS.BASE_HOUSING_STOCK
);

const scenarioRange = getScenarioRange(allScenarios);
```

<div class="grid grid-cols-4">
  <div class="card grid-colspan-1">
    <h3>Scenario Selection</h3>

```js
// Migration scenario input
const migrationOptions = [
  {value: "M3", label: "Low Migration"},
  {value: "M2", label: "Baseline Migration"},
  {value: "M1", label: "High Migration"}
];
const migrationInput = view(Inputs.radio(migrationOptions, {
  label: "Migration Scenario",
  value: migrationOptions[1],
  format: d => d.label
}));
```

```js
// Headship scenario input
const headshipOptions = [
  {value: "current", label: "Irish Current"},
  {value: "gradual", label: "Gradual convergence (until 2050)"},
  {value: "fast", label: "Fast convergence (until 2035)"}
];
const headshipInput = view(Inputs.radio(headshipOptions, {
  label: "Household Formation",
  value: headshipOptions[0],
  format: d => d.label
}));
```

```js
// Obsolescence rate input
const obsolescenceInput = view(Inputs.radio(
  [0, 0.0025, 0.005],
  {
    label: "Obsolescence Rate",
    value: 0.0025,
    step: 0.0005,
    format: d => (d * 100).toFixed(2) + "%"
  }
));
```

<h4>Projected Population (15+)</h4>

```js
// Calculate total population by year for selected scenario
const scenarioData = populationByCohort[migrationInput.value].data;
const populationByYear = Object.entries(scenarioData).map(([year, yearData]) => ({
  year: +year,
  population: yearData.total
})).sort((a, b) => a.year - b.year);

display(Plot.plot({
  height: 200,
  marginLeft: 60,
  x: { label: "Year" },
  y: { label: "Population (millions)", transform: d => d / 1_000_000 },
  marks: [
    Plot.line(populationByYear, { x: "year", y: "population", stroke: "steelblue", strokeWidth: 2 }),
    Plot.dot(populationByYear, { x: "year", y: "population", fill: "steelblue", r: 3 })
  ]
}));
```

  </div>
  <div class="card grid-colspan-3">

```js
// Generate time series for selected scenario
const timeSeries = generateCohortTimeSeries(
  populationByCohort[migrationInput.value].data,
  headshipRates.current.rates,
  headshipRates.uk_convergence.rates,
  headshipInput.value,
  obsolescenceInput,
  CONSTANTS.BASE_HOUSING_STOCK
);
```

```jsx
display(<DemandChart
  selectedScenario={timeSeries}
  scenarioRange={scenarioRange}
  width={width}
  yearDomain={[2023, 2050]}
  periodBreak={2035}
/>)
```

  </div>
</div>


---

## Understanding the Model

<div class="grid grid-cols-2">
  <div class="note">
    <h4>How This Works</h4>
    <p>This projection uses <strong>age-specific headship rates</strong> applied to CSO population projections:</p>
    <ul>
      <li><strong>Population data</strong>: CSO M1/M2/M3 scenarios by 5-year age cohorts</li>
      <li><strong>Headship rates</strong>: Proportion of each age group heading a household</li>
      <li><strong>Obsolescence</strong>: Annual replacement of deteriorating housing stock</li>
    </ul>
    <p>Annual Housing Need = Household Growth + Obsolescence</p>
  </div>
  <div class="note">
    <h4>Key Assumptions</h4>
    <ul>
      <li><strong>Irish Current</strong>: Headship rates stay at 2022 levels</li>
      <li><strong>Gradual Convergence</strong>: Linear shift to UK rates over 20 years (2022-2042)</li>
      <li><strong>UK Rates</strong>: Immediate adoption of UK household formation patterns</li>
    </ul>
    <p>Higher headship rates mean more people forming independent households, increasing demand.</p>
  </div>
</div>

---

<div class="source-info">
  <p>Source: Population projections from CSO (M1/M2/M3 scenarios). Headship rates estimated based on Census data and UK comparisons.</p>
  <p>Reference lines: 52k (ESRI RS190 estimate), 33k (2023 actual completions)</p>
</div>


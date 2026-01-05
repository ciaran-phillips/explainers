---
toc: false
---

# Housing Demand Projections

An interactive tool to explore Ireland's projected housing demand from 2022 to 2057, using age-cohort-based population projections and headship rates.

```js
// Import calculation functions
import {
  CONSTANTS,
  COHORT_GROUPS,
  generateCohortTimeSeries,
  generateAllCohortScenarios,
  getScenarioRange,
  filterTimeSeries
} from "./components/cohort-calculations.js";

// Import React components
import { ProjectionChart } from "./components/ProjectionChart.js";
import { ProjectionStats } from "./components/ProjectionStats.js";
import { CohortBreakdownChart } from "./components/CohortBreakdownChart.js";
import { ScenarioComparisonTable } from "./components/ScenarioComparisonTable.js";
```

```js
// Load data
const populationByCohort = await FileAttachment("data/population-by-cohort.json").json();
const headshipRates = await FileAttachment("data/headship-rates-by-cohort.json").json();
```

```js
// Pre-calculate all 9 scenario combinations
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
  {value: "M1", label: "Low Migration"},
  {value: "M2", label: "Baseline Migration"},
  {value: "M3", label: "High Migration"}
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
  {value: "gradual", label: "Gradual Convergence (20yr)"},
  {value: "uk", label: "UK Rates"}
];
const headshipInput = view(Inputs.radio(headshipOptions, {
  label: "Household Formation",
  value: headshipOptions[0],
  format: d => d.label
}));
```

```js
// Time range inputs
const startYearInput = view(Inputs.range(
  [2023, 2045],
  {
    label: "Start Year",
    value: 2024,
    step: 1
  }
));
```

```js
const endYearInput = view(Inputs.range(
  [2030, 2057],
  {
    label: "End Year",
    value: 2050,
    step: 1
  }
));
```

```js
// Obsolescence rate input
const obsolescenceInput = view(Inputs.range(
  [0, 0.005],
  {
    label: "Obsolescence Rate",
    value: 0.0025,
    step: 0.0005,
    format: d => (d * 100).toFixed(2) + "%"
  }
));
```

  </div>
  <div class="card grid-colspan-3">

```js
// Find selected scenario
const selectedScenarioId = `${migrationInput.value}-${headshipInput.value}`;
const selectedScenario = allScenarios.find(s => s.id === selectedScenarioId);

// Debug: show what we found
display(`Selected: ${selectedScenarioId}, Found: ${selectedScenario ? 'yes' : 'no'}`);
```

```js
// Recalculate if obsolescence rate changed from default
const selectedTimeSeries = (selectedScenario && obsolescenceInput === 0.0025)
  ? selectedScenario.timeSeries
  : generateCohortTimeSeries(
      populationByCohort[migrationInput.value].data,
      headshipRates.current.rates,
      headshipRates.uk_convergence.rates,
      headshipInput.value,
      obsolescenceInput,
      CONSTANTS.BASE_HOUSING_STOCK
    );
```

```js
// Test with simple Plot chart instead of JSX
import * as Plot from "npm:@observablehq/plot";

const testData = selectedTimeSeries?.slice(0, 10) || [];
display(Plot.plot({
  marks: [
    Plot.line(testData, {x: "year", y: "demand"})
  ]
}));
```

  </div>
</div>

<div class="card">

```js
// Debug stats
display(`Migration: ${migrationInput.value}, Headship: ${headshipInput.value}`);
```

</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h3>Household Formation by Age Group</h3>

```js
// Debug: cohort breakdown placeholder
display(`Years: ${startYearInput} - ${endYearInput}`);
```

  </div>
  <div class="card">
    <h3>Scenario Comparison</h3>

```js
// Debug: scenario count
display(`Total scenarios: ${allScenarios?.length ?? 0}`);
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

<style>

.note {
  background: var(--theme-background-alt);
  border-left: 4px solid var(--theme-foreground-focus);
  padding: 1rem 1.5rem;
  border-radius: 0 8px 8px 0;
}

.note h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.note p, .note ul {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.note ul {
  padding-left: 1.25rem;
}

.source-info {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
}

/* Stats Component */
.projection-stats {
  padding: 0.5rem 0;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
}

.scenario-label {
  background: var(--theme-background-alt);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.scenario-separator {
  color: var(--theme-foreground-faint);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: var(--theme-background-alt);
  border-radius: 8px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--theme-foreground);
}

.stat-value.gap-positive {
  color: #dc2626;
}

.stat-value.gap-negative {
  color: #10b981;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin-top: 0.25rem;
}

.stat-sublabel {
  font-size: 0.75rem;
  color: var(--theme-foreground-faint);
}

/* Cohort Breakdown */
.cohort-breakdown {
  position: relative;
}

.cohort-legend {
  display: none; /* Using Plot's built-in legend */
}

/* Comparison Table */
.scenario-comparison-wrapper {
  overflow-x: auto;
}

.scenario-comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.scenario-comparison-table th {
  padding: 0.75rem 0.5rem;
  text-align: right;
  font-weight: 600;
  color: var(--theme-foreground-muted);
  border-bottom: 2px solid var(--theme-foreground-faintest);
}

.scenario-comparison-table th:first-child {
  text-align: left;
}

.scenario-comparison-table .subheader {
  font-weight: normal;
  font-size: 0.7rem;
}

.scenario-comparison-table td {
  padding: 0.5rem;
  text-align: right;
  border-bottom: 1px solid var(--theme-foreground-faintest);
}

.scenario-comparison-table .label-cell {
  text-align: left;
  padding-left: 1rem;
}

.scenario-comparison-table .migration-header td {
  background: var(--theme-background-alt);
  font-weight: 600;
  padding: 0.5rem;
  text-align: left;
}

.scenario-comparison-table .selected-row {
  background: rgba(30, 58, 138, 0.1);
}

.scenario-comparison-table .selected-row td {
  font-weight: 600;
}

.scenario-comparison-table .avg-cell {
  font-weight: 600;
  background: var(--theme-background-alt);
}

</style>

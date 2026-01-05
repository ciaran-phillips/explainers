---
toc: false
---

# Housing Demand Calculator

An interactive tool to explore Ireland's projected housing demand based on the ESRI model from "Population Projections, The Flow of New Households and Structural Housing Demand" (RS190, July 2024).

```js
// Import calculation functions
import {
  generateScenarioTimeSeries,
  generateAllScenarios,
  getScenarioRange
} from "./components/calculations.js";

// Import React components
import { DemandChart } from "./components/DemandChart.js";
import { SummaryStats } from "./components/SummaryStats.js";
import { ComparisonTable } from "./components/ComparisonTable.js";
import { BreakdownChart } from "./components/BreakdownChart.js";
```

```js
// Load data
const scenarios = await FileAttachment("data/scenarios.json").json();
const populationProjections = await FileAttachment("data/population-projections.json").json();
const headshipRates = await FileAttachment("data/headship-rates.json").json();
```

```js
// Pre-calculate all 12 scenarios
const allScenarios = generateAllScenarios(
  populationProjections,
  headshipRates,
  scenarios.obsolescenceScenarios,
  scenarios.housingStock[2022]
);

const scenarioRange = getScenarioRange(allScenarios);
```

<div class="grid grid-cols-4">
  <div class="card grid-colspan-1">
    <h3>Scenario Selection</h3>

```js
// Migration scenario input
const migrationOptions = Object.entries(scenarios.populationScenarios).map(([key, value]) => ({
  value: key,
  label: value.label
}));
const migrationInput = view(Inputs.radio(migrationOptions, {
  label: "Migration",
  value: "baseline",
  format: d => d.label
}));
```

```js
// Headship scenario input
const headshipOptions = Object.entries(scenarios.headshipScenarios).map(([key, value]) => ({
  value: key,
  label: value.label
}));
const headshipInput = view(Inputs.radio(headshipOptions, {
  label: "Household Formation",
  value: "current",
  format: d => d.label
}));
```

```js
// Obsolescence rate input
const obsolescenceOptions = Object.entries(scenarios.obsolescenceScenarios).map(([key, value]) => ({
  value: key,
  label: value.label
}));
const obsolescenceInput = view(Inputs.radio(obsolescenceOptions, {
  label: "Obsolescence Rate",
  value: "low",
  format: d => d.label
}));
```

  </div>
  <div class="card grid-colspan-3">

```js
// Generate selected scenario time series
const selectedTimeSeries = generateScenarioTimeSeries(
  populationProjections[migrationInput.value].data,
  headshipRates[headshipInput.value].data,
  scenarios.obsolescenceScenarios[obsolescenceInput.value].rate,
  scenarios.housingStock[2022]
);
```

```jsx
display(<DemandChart
  selectedScenario={selectedTimeSeries}
  scenarioRange={scenarioRange}
  width={width}
/>)
```

  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">

```jsx
display(<SummaryStats
  selectedScenario={selectedTimeSeries}
  allScenarios={allScenarios}
/>)
```

  </div>
  <div class="card">

```jsx
display(<ComparisonTable
  selectedScenario={selectedTimeSeries}
  allScenarios={allScenarios}
/>)
```

  </div>
</div>

<div class="card">
  <h3>Demand Breakdown by Component</h3>

```jsx
resize((width) => display(<BreakdownChart
  selectedScenario={selectedTimeSeries}
  width={width}
/>))
```

</div>

---

## Understanding the Model

<div class="grid grid-cols-2">
  <div class="note">
    <h4>What This Shows</h4>
    <p>This calculator shows <strong>structural housing demand</strong> - the number of new dwellings needed each year based on:</p>
    <ul>
      <li><strong>Population growth</strong> - people need places to live</li>
      <li><strong>Household formation</strong> - changing household sizes</li>
      <li><strong>Replacing obsolete housing</strong> - wear and tear</li>
    </ul>
    <p><strong>Note:</strong> This does NOT include pent-up demand from existing housing shortages. The actual need may be higher.</p>
  </div>
  <div class="note">
    <h4>Understanding the Range</h4>
    <p>The wide range across scenarios isn't measurement error - it reflects genuine uncertainty about:</p>
    <ul>
      <li>How many people will move to Ireland</li>
      <li>How fast household sizes will fall</li>
      <li>How quickly housing stock will deteriorate</li>
    </ul>
    <p>Different assumptions lead to very different futures.</p>
  </div>
</div>

---

<div class="source-info">
  <p>Source: ESRI Research Series RS190, "Population Projections, The Flow of New Households and Structural Housing Demand", July 2024.</p>
  <p>Formula: Annual Housing Demand = New Households Formation + Replacement Stock</p>
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

/* Summary Stats */
.summary-stats h3 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--theme-foreground-muted);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--theme-foreground-faintest);
}

.stat-label {
  color: var(--theme-foreground-muted);
}

.stat-value {
  font-weight: 600;
}

.stat-range {
  margin-top: 1rem;
  padding-top: 0.5rem;
}

.range-header {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin-bottom: 0.5rem;
}

.range-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

/* Comparison Table */
.comparison-table-wrapper {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.comparison-table th {
  padding: 0.75rem 1rem;
  text-align: right;
  font-weight: 600;
  color: var(--theme-foreground-muted);
  border-bottom: 2px solid var(--theme-foreground-faintest);
}

.comparison-table th:first-child {
  text-align: left;
}

.comparison-table .subheader {
  font-weight: normal;
  font-size: 0.75rem;
}

.comparison-table td {
  padding: 0.75rem 1rem;
  text-align: right;
  border-bottom: 1px solid var(--theme-foreground-faintest);
}

.comparison-table .label-cell {
  text-align: left;
  font-weight: 500;
}

.comparison-table .selected-row {
  background: var(--theme-foreground-focus);
  background-opacity: 0.1;
}

.comparison-table .selected-row td {
  color: var(--theme-foreground-focus);
  font-weight: 600;
}

.comparison-table .avg-row {
  background: var(--theme-background-alt);
}

</style>

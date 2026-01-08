---
toc: false
---

# Housing Demand Projections

An interactive tool to explore Ireland's projected housing demand, comparing ESRI and Central Bank methodologies.

```js
// Import ESRI calculation functions
import {
  generateScenarioTimeSeries
} from "./components/calculations.js";

// Import Central Bank calculation functions
import {
  CONSTANTS,
  generateCohortTimeSeries
} from "./components/cohort-calculations.js";

// Import React components
import { DemandChart } from "./components/DemandChart.js";
import { ShowWhen } from "./components/ShowWhen.js";
```

```js
// Load ESRI data
const esriScenarios = await FileAttachment("data/esri-scenarios.json").json();
const esriPopulation = await FileAttachment("data/esri-population-projections.json").json();
const esriHeadship = await FileAttachment("data/esri-headship-rates.json").json();

// Load Central Bank data
const cbPopulation = await FileAttachment("data/cb-population-by-cohort.json").json();
const cbHeadship = await FileAttachment("data/cb-headship-rates.json").json();
```

<div class="grid grid-cols-4">
  <div class="card grid-colspan-1">
    <h3>Source & Scenario Selection</h3>

```js
// Source selection
const sourceOptions = [
  {value: "esri", label: "ESRI"},
  {value: "cb", label: "Central Bank"}
];
const sourceInput = view(Inputs.radio(sourceOptions, {
  label: "Source",
  value: sourceOptions[0],
  format: d => d.label
}));
```

```js
// ESRI inputs
const esriMigrationOptions = Object.entries(esriScenarios.populationScenarios).map(([key, value]) => ({
  value: key,
  label: value.label
}));
const esriMigrationRadio = Inputs.radio(esriMigrationOptions, {
  label: "Migration",
  value: "baseline",
  format: d => d.label,
  valueof: d => d.value
});
const esriMigrationInput = Generators.input(esriMigrationRadio);

const esriHeadshipOptions = Object.entries(esriScenarios.headshipScenarios).map(([key, value]) => ({
  value: key,
  label: value.label
}));
const esriHeadshipRadio = Inputs.radio(esriHeadshipOptions, {
  label: "Household Formation",
  value: "current",
  format: d => d.label,
  valueof: d => d.value
});
const esriHeadshipInput = Generators.input(esriHeadshipRadio);

const esriObsolescenceOptions = Object.entries(esriScenarios.obsolescenceScenarios).map(([key, value]) => ({
  value: key,
  label: value.label
}));
const esriObsolescenceRadio = Inputs.radio(esriObsolescenceOptions, {
  label: "Obsolescence Rate",
  value: "low",
  format: d => d.label,
  valueof: d => d.value
});
const esriObsolescenceInput = Generators.input(esriObsolescenceRadio);
```

```js
// Central Bank inputs
const cbMigrationOptions = [
  {value: "M3", label: "Low Migration"},
  {value: "M2", label: "Baseline Migration"},
  {value: "M1", label: "High Migration"}
];
const cbMigrationRadio = Inputs.radio(cbMigrationOptions, {
  label: "Migration",
  value: cbMigrationOptions[1],
  format: d => d.label
});
const cbMigrationInput = Generators.input(cbMigrationRadio);

const cbHeadshipOptions = [
  {value: "current", label: "Irish Current"},
  {value: "gradual", label: "Gradual convergence"},
  {value: "fast", label: "Fast convergence"}
];
const cbHeadshipRadio = Inputs.radio(cbHeadshipOptions, {
  label: "Household Formation",
  value: cbHeadshipOptions[0],
  format: d => d.label
});
const cbHeadshipInput = Generators.input(cbHeadshipRadio);

const cbObsolescenceOptions = [
  {value: 0, label: "None (0%)"},
  {value: 0.0025, label: "Low (0.25%)"},
  {value: 0.005, label: "Medium (0.5%)"}
];
const cbObsolescenceRadio = Inputs.radio(cbObsolescenceOptions, {
  label: "Obsolescence Rate",
  value: cbObsolescenceOptions[1],
  format: d => d.label
});
const cbObsolescenceInput = Generators.input(cbObsolescenceRadio);
```

```js
view(esriMigrationRadio)
view(esriHeadshipRadio)
view(esriObsolescenceRadio)
```



  </div>

```js
// Generate time series based on selected source
const selectedTimeSeries = sourceInput.value === "cb"
  ? generateCohortTimeSeries(
      cbPopulation[cbMigrationInput.value].data,
      cbHeadship[cbHeadshipInput.value].data,
      cbObsolescenceInput.value,
      CONSTANTS.BASE_HOUSING_STOCK
    )
  : generateScenarioTimeSeries(
      esriPopulation[esriMigrationInput].data,
      esriHeadship[esriHeadshipInput].data,
      esriScenarios.obsolescenceScenarios[esriObsolescenceInput].rate,
      esriScenarios.housingStock[2022]
    );

// Scale factor: ESRI data is in thousands, CB data is in units
const chartScale = sourceInput.value === "cb" ? 1 : 1000;
```


<div class="card grid-colspan-3">

```js
view(cbMigrationRadio)
view(cbHeadshipRadio)
view(cbObsolescenceRadio)
```
</div>

```jsx
display(<DemandChart
  selectedScenario={selectedTimeSeries}
  scenarioRange={[]}
  width={width}
  scale={chartScale}
  yearDomain={[2023, 2040]}
/>)
```

  </div>
</div>

---

<div class="source-info">
  <p><strong>Sources:</strong></p>
  <ul>
    <li><strong>ESRI:</strong> Research Series RS190, "Population Projections, The Flow of New Households and Structural Housing Demand", July 2024</li>
    <li><strong>Central Bank:</strong> Age-cohort based projections using CSO M1/M2/M3 population scenarios</li>
  </ul>
</div>

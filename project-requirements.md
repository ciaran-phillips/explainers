# Housing Demand Model - Scenario Explorer Specification

## Project Overview
Create an interactive housing demand calculator using Observable Framework that replicates the ESRI model from "Population Projections, The Flow of New Households and Structural Housing Demand" (RS190, July 2024).

## Technical Stack
- **Framework**: Observable Framework (https://observablehq.com/framework/)
- **Visualization Library**: Observable Plot (primary), D3.js (if needed for custom interactions)
- **Styling**: Tailwind CSS (Observable Framework default)
- **Data Format**: JSON data loaders in `/data` directory

## Data Model

### Core Calculation
```
Annual Housing Demand = New Households Formation + Replacement Stock

Where:
- New Households Formation = (Population_t - Population_t-1) × Headship Rate_t + Existing Population × (Headship Rate_t - Headship Rate_t-1)
- Replacement Stock = Current Housing Stock × Obsolescence Rate
```

### Input Parameters (from ESRI Report)

#### 1. Population Scenarios (Table 4.1, Appendix A.1)
```javascript
const populationScenarios = {
  baseline: {
    label: "Baseline Migration",
    description: "+35k/year to 2030, +20k/year after",
    data: {
      2022: 5184.0,  // thousands
      2023: 5282.0,  // from CSO estimate
      2030: 5699.9,
      2040: 6106.1
      // Interpolate intermediate years linearly
    }
  },
  high: {
    label: "High Migration", 
    description: "+10k/year above baseline",
    data: {
      2022: 5184.0,
      2030: 5699.9 * 1.018,  // +1.8% at 2030
      2040: 6106.1 * 1.033   // +3.3% at 2040
    }
  },
  low: {
    label: "Low Migration",
    description: "-10k/year below baseline", 
    data: {
      2022: 5184.0,
      2030: 5699.9 * 0.982,  // -1.8% at 2030
      2040: 6106.1 * 0.967   // -3.3% at 2040
    }
  }
};
```

#### 2. Headship Rate Scenarios (Section 3.2, Table 3.1)
```javascript
const headshipScenarios = {
  current: {
    label: "Current Trends",
    description: "Household size: 2.8 → 2.6 (demographic change only)",
    headshipRate: {
      2022: 0.357,  // 1/2.8
      2030: 0.370,  // interpolate to 0.385
      2040: 0.385   // 1/2.6
    }
  },
  falling: {
    label: "Falling Household Size",
    description: "Household size: 2.8 → 2.4 (European convergence)",
    headshipRate: {
      2022: 0.357,  // 1/2.8
      2030: 0.395,  // interpolate to 0.417
      2040: 0.417   // 1/2.4
    }
  }
};
```

#### 3. Obsolescence Rate (Section 3.3)
```javascript
const obsolescenceScenarios = {
  low: {
    label: "Low (0.25%)",
    description: "Lower bound estimate",
    rate: 0.0025
  },
  high: {
    label: "High (0.50%)",
    description: "Higher bound estimate",  
    rate: 0.0050
  }
};
```

#### 4. Housing Stock
```javascript
const housingStock = {
  2022: 2112.1  // thousands, from Census 2022 (page 21)
};
```

## User Interface Components

### 1. Control Panel (Left Sidebar or Top)
```
┌─────────────────────────────────────┐
│  Housing Demand Calculator          │
├─────────────────────────────────────┤
│                                     │
│  Migration Scenario                 │
│  ○ Baseline (+35k/year → +20k)     │
│  ○ High Migration (+10k more)      │
│  ○ Low Migration (-10k less)       │
│                                     │
│  Household Formation                │
│  ○ Current Trends (size: 2.8→2.6)  │
│  ○ Falling Size (size: 2.8→2.4)    │
│                                     │
│  Housing Obsolescence               │
│  ○ Low (0.25% per year)            │
│  ○ High (0.50% per year)           │
│                                     │
└─────────────────────────────────────┘
```

### 2. Results Display

#### A. Main Chart: Annual Housing Demand (2023-2040)
- **Type**: Line chart with area fill
- **X-axis**: Years (2023-2040)
- **Y-axis**: Housing units needed (thousands)
- **Features**:
  - Primary line: Selected scenario demand
  - Shaded range: Min-max across all 12 scenarios
  - Vertical divider at 2030 (migration assumption changes)
  - Hover tooltip showing exact values
  - Annotation for average 2023-2030 and 2030-2040

#### B. Summary Statistics Card
```
┌──────────────────────────────────────────┐
│  PROJECTED HOUSING DEMAND                │
├──────────────────────────────────────────┤
│  2023-2030 Average:   44,000/year       │
│  2030-2040 Average:   39,700/year       │
│                                          │
│  Your Scenario:       47,500/year       │
│  Range (all scenarios): 35k - 53k/year  │
└──────────────────────────────────────────┘
```

#### C. Scenario Comparison Table
```
┌───────────────────────────────────────────────────────┐
│           │  2023-2030  │  2030-2040  │  Total        │
├───────────────────────────────────────────────────────┤
│ Your      │   47,500    │   42,000    │   730,500     │
│ Minimum   │   35,000    │   27,800    │   502,000     │
│ Maximum   │   53,300    │   52,400    │   847,000     │
│ Average   │   44,000    │   39,700    │   670,000     │
└───────────────────────────────────────────────────────┘
```

#### D. Component Breakdown (Stacked Bar/Area)
Show the calculation components for selected scenario:
- New household formation (largest)
- Replacement/obsolescence (smaller, steady)

## Technical Implementation Notes

### File Structure
```
housing-model/
├── docs/
│   └── index.md                    # Main page
├── data/
│   ├── population-projections.json.js
│   ├── scenarios.json.js
│   └── calculations.js             # Calculation logic
├── components/
│   ├── controls.js                 # Input controls
│   ├── demandChart.js              # Main visualization
│   └── summaryStats.js             # Summary cards
└── observablehq.config.js
```

### Data Loaders (`data/` directory)

#### population-projections.json.js
```javascript
// Generate annual population for each scenario (2022-2040)
// Linear interpolation between known points
export default async function() {
  function interpolate(start, end, steps) {
    // Return array of interpolated values
  }
  
  return {
    baseline: interpolate(/* ... */),
    high: interpolate(/* ... */),
    low: interpolate(/* ... */)
  };
}
```

#### calculations.js
```javascript
// Core calculation functions
export function calculateHousingDemand(year, population, headshipRate, prevPopulation, prevHeadship, housingStock, obsolescenceRate) {
  const newHouseholds = 
    (population - prevPopulation) * headshipRate + 
    prevPopulation * (headshipRate - prevHeadship);
  
  const replacement = housingStock * obsolescenceRate;
  
  return newHouseholds + replacement;
}

export function generateScenario(populationScenario, headshipScenario, obsolescenceScenario) {
  // Returns array of {year, demand} objects
}
```

### Reactive Components (in index.md)

```javascript
// User inputs (reactive)
const migrationInput = view(Inputs.radio(
  ["baseline", "high", "low"],
  {label: "Migration Scenario", value: "baseline"}
));

const headshipInput = view(Inputs.radio(
  ["current", "falling"],
  {label: "Household Formation", value: "current"}
));

const obsolescenceInput = view(Inputs.radio(
  ["low", "high"],
  {label: "Obsolescence Rate", value: "low"}
));

// Derived calculations
const selectedScenario = calculateScenario(
  migrationInput,
  headshipInput,
  obsolescenceInput
);

const allScenarios = calculateAllScenarios(); // All 12 combinations

// Summary stats
const avg2023_2030 = d3.mean(selectedScenario.filter(d => d.year >= 2023 && d.year <= 2030), d => d.demand);
```

### Visualization Code (Observable Plot)

```javascript
Plot.plot({
  width: 800,
  height: 400,
  marginLeft: 60,
  x: {
    label: "Year",
    domain: [2023, 2040]
  },
  y: {
    label: "Annual Housing Demand (thousands)",
    grid: true
  },
  marks: [
    // Range band (min-max across all scenarios)
    Plot.areaY(allScenariosRange, {
      x: "year",
      y1: "min",
      y2: "max",
      fill: "lightgray",
      opacity: 0.3
    }),
    
    // Selected scenario line
    Plot.line(selectedScenario, {
      x: "year",
      y: "demand",
      stroke: "#2563eb",
      strokeWidth: 3
    }),
    
    // Points for hover
    Plot.dot(selectedScenario, {
      x: "year",
      y: "demand",
      fill: "#2563eb",
      r: 4,
      title: d => `${d.year}: ${d.demand.toLocaleString()} units`
    }),
    
    // 2030 divider line
    Plot.ruleX([2030], {
      stroke: "gray",
      strokeDasharray: "4,4"
    }),
    
    // Average lines
    Plot.ruleY([avg2023_2030], {
      stroke: "green",
      strokeDasharray: "2,2",
      strokeWidth: 2
    })
  ]
})
```

## Data Accuracy Requirements

### Validation Against Report Tables
The implementation must match these values from Table 4.3:

| Scenario | Migration | Headship | Obs | 2023-2030 | 2030-2040 |
|----------|-----------|----------|-----|-----------|-----------|
| 1 | Base | Current | 0.25% | 37,900 | 32,000 |
| 2 | Base | Current | 0.50% | 42,200 | 37,600 |
| 3 | Base | Falling | 0.25% | 45,800 | 41,600 |
| 4 | Base | Falling | 0.50% | 50,300 | 47,400 |
| 5 | High | Current | 0.25% | 40,700 | 36,300 |
| 6 | High | Current | 0.50% | 45,100 | 41,900 |
| 7 | High | Falling | 0.25% | 48,900 | 44,200 |
| 8 | High | Falling | 0.50% | 53,300 | 52,400 |
| 9 | Low | Current | 0.25% | 35,000 | 27,800 |
| 10 | Low | Current | 0.50% | 39,400 | 33,300 |
| 11 | Low | Falling | 0.25% | 42,800 | 36,700 |
| 12 | Low | Falling | 0.50% | 47,200 | 42,400 |

**Average across all**: 44,000 (2023-2030), 39,700 (2030-2040)

## Educational Context

Include prominent callout boxes:

### What This Shows
```markdown
This calculator shows **structural housing demand** – the number of new 
dwellings needed each year based on:
- Population growth (people need places to live)
- Household formation (changing household sizes)  
- Replacing obsolete housing (wear and tear)

⚠️ **This does NOT include pent-up demand** from existing housing shortages.
The actual need may be higher.
```

### Understanding the Range
```markdown
The wide range (35k-53k) isn't measurement error – it reflects genuine 
uncertainty about:
- How many people will move to Ireland
- How fast household sizes will fall
- How quickly our housing stock will deteriorate

Different assumptions lead to very different futures.
```

## Performance Considerations
- All calculations should be client-side (no server needed)
- Pre-calculate all 12 scenarios on page load
- Use Observable's reactivity for instant updates when inputs change
- Keep data files small (<100KB total)

## Accessibility
- All radio buttons must be keyboard navigable
- Chart must have descriptive title and axis labels
- Color contrast must meet WCAG AA standards
- Include text alternatives for all visualizations

## Future Enhancements (Not v1)
- Regional breakdown map
- Cumulative gap chart vs. actual building rates
- "What does X houses mean?" contextualizer
- Export scenario as PDF/image
- Comparison to historical building rates

---

## Implementation Checklist
- [ ] Set up Observable Framework project
- [ ] Create data loaders with population projections
- [ ] Implement housing demand calculation function
- [ ] Validate calculations against Table 4.3 values
- [ ] Build reactive input controls
- [ ] Create main demand chart (Plot)
- [ ] Add summary statistics cards
- [ ] Add scenario comparison table
- [ ] Include educational context callouts
- [ ] Test all 12 scenario combinations
- [ ] Responsive design for mobile
- [ ] Accessibility audit
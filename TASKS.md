# Implementation Tasks

Broken down from `project-requirements.md`. Tasks are ordered by dependency.

---

## Phase 1: Data Layer

### 1.1 Create scenario configuration data
**File:** `src/data/scenarios.json`

Create static JSON with all scenario parameters:
- 3 population scenarios (baseline, high, low) with values from Table 4.1
- 2 headship rate scenarios (current, falling) with values from Section 3.2
- 2 obsolescence rates (0.25%, 0.50%)
- Housing stock base value (2,112,100 from Census 2022)

### 1.2 Create population projections data loader
**File:** `src/data/population-projections.json.js`

- Implement linear interpolation function for years between known data points
- Generate annual population (2022-2040) for each of the 3 migration scenarios
- Key data points: 2022 (5184.0k), 2023 (5282.0k), 2030, 2040

### 1.3 Create headship rate data loader
**File:** `src/data/headship-rates.json.js`

- Generate annual headship rates (2022-2040) for both scenarios
- Linear interpolation between 2022 → 2030 → 2040 values
- Current: 0.357 → 0.370 → 0.385
- Falling: 0.357 → 0.395 → 0.417

### 1.4 Implement core calculation module
**File:** `src/components/calculations.js`

Functions needed:
- `calculateAnnualDemand(year, pop, prevPop, headship, prevHeadship, stock, obsRate)` - implements the formula from spec
- `generateScenarioTimeSeries(popScenario, headshipScenario, obsRate)` - returns array of {year, demand, newHouseholds, replacement}
- `generateAllScenarios()` - returns all 12 scenario combinations
- `calculatePeriodAverage(timeSeries, startYear, endYear)` - for summary stats

### 1.5 Validate calculations against Table 4.3
**File:** `src/data/validation.test.js` (or inline validation)

Create validation that checks calculated values match the 12 scenarios in Table 4.3:
- Scenario 1 (Base/Current/0.25%): 37,900 avg (2023-2030), 32,000 avg (2030-2040)
- ... all 12 scenarios
- Overall average: 44,000 (2023-2030), 39,700 (2030-2040)

**Acceptance criteria:** All 12 scenarios within ±500 of report values (allows for rounding)

---

## Phase 2: Core UI Components

### 2.1 Create input controls component
**File:** `src/components/controls.js`

Three radio button groups using Observable Inputs:
- Migration scenario (baseline/high/low) with labels and descriptions
- Household formation (current/falling) with labels
- Obsolescence rate (low 0.25%/high 0.50%)

Export reactive inputs for use in main page.

### 2.2 Create main demand chart
**File:** `src/components/demandChart.js`

Observable Plot chart with:
- Line chart of selected scenario (2023-2040)
- Shaded area showing min-max range across all 12 scenarios
- Vertical dashed line at 2030 (migration assumption change)
- Hover tooltips with exact values
- Horizontal reference lines for period averages
- Proper axis labels and formatting (thousands)

### 2.3 Create summary statistics card
**File:** `src/components/summaryStats.js`

Display card showing:
- 2023-2030 average for selected scenario
- 2030-2040 average for selected scenario
- Range across all scenarios (min-max)
- Format numbers with thousands separator

### 2.4 Create scenario comparison table
**File:** `src/components/comparisonTable.js`

HTML table showing:
- Row: Your scenario | 2023-2030 avg | 2030-2040 avg | Total (18 years)
- Row: Minimum across all scenarios
- Row: Maximum across all scenarios
- Row: Average across all scenarios

### 2.5 Create component breakdown chart
**File:** `src/components/breakdownChart.js`

Stacked area or bar chart showing:
- New household formation component
- Replacement/obsolescence component
- For the selected scenario over time

---

## Phase 3: Main Page Assembly

### 3.1 Create main page layout
**File:** `src/index.md`

Structure:
- Title and introduction
- Control panel (sidebar or top section)
- Main chart area
- Summary stats cards
- Comparison table
- Component breakdown chart
- Educational callouts

### 3.2 Wire up reactive data flow
**In:** `src/index.md`

- Import all data loaders and components
- Connect input controls to calculation functions
- Make charts and stats update reactively when inputs change
- Pre-calculate all 12 scenarios on load for range display

### 3.3 Add educational context callouts
**In:** `src/index.md`

Two callout boxes from spec:
- "What This Shows" - explains structural demand vs pent-up demand
- "Understanding the Range" - explains uncertainty in projections

---

## Phase 4: Polish & Accessibility

### 4.1 Responsive design
- Test and adjust layout for mobile viewports
- Ensure charts resize appropriately
- Stack controls vertically on small screens

### 4.2 Accessibility audit
- Keyboard navigation for all controls
- WCAG AA color contrast
- Descriptive chart titles and labels
- Text alternatives for visualizations (aria-labels, summary text)

### 4.3 Update app configuration
**File:** `observablehq.config.js`

- Set appropriate page title
- Configure any navigation if multi-page

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 5 | Data layer and calculations |
| 2 | 5 | UI components |
| 3 | 3 | Page assembly and integration |
| 4 | 3 | Polish and accessibility |
| **Total** | **16** | |

### Suggested order
1. Tasks 1.1-1.4 (can be done in parallel)
2. Task 1.5 (validate before building UI)
3. Tasks 2.1-2.5 (can be mostly parallel)
4. Tasks 3.1-3.3 (sequential)
5. Tasks 4.1-4.3 (after core is working)

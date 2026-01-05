# Interactive Housing Demand Projection Tool - Specification

## Overview
An interactive tool that allows users to explore how different demographic and policy assumptions affect Ireland's projected annual housing needs from 2022 to 2057.

---

## Data Inputs

### 1. Population Data (From CSV)
- **Source:** population_by_cohort.csv
- **Structure:** year, age_cohort, scenario, population
- **Years:** 2022-2057 (36 years)
- **Scenarios:** M1 (low migration), M2 (baseline migration), M3 (high migration)
- **Age Cohorts:** 0-4, 5-9, 10-14, 15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74, 75-79, 80-84, 85+

### 2. Headship Rates (Estimated for Prototype)
Age-specific rates representing the proportion of people in each age group who head a household.

**Irish Current Rates (2022 baseline - estimated):**
```
15-19: 0.02  (2%)
20-24: 0.10  (10%)
25-29: 0.26  (26%)
30-34: 0.42  (42%)
35-39: 0.48  (48%)
40-44: 0.50  (50%)
45-49: 0.51  (51%)
50-54: 0.52  (52%)
55-59: 0.53  (53%)
60-64: 0.54  (54%)
65-69: 0.55  (55%)
70-74: 0.56  (56%)
75-79: 0.57  (57%)
80-84: 0.58  (58%)
85+:   0.60  (60%)
```

**UK Convergence Rates (aspirational - estimated):**
```
15-19: 0.03  (3%)
20-24: 0.15  (15%)
25-29: 0.38  (38%)  ← Report mentions this specific figure
30-34: 0.52  (52%)
35-39: 0.56  (56%)
40-44: 0.58  (58%)
45-49: 0.59  (59%)
50-54: 0.60  (60%)
55-59: 0.61  (61%)
60-64: 0.62  (62%)
65-69: 0.63  (63%)
70-74: 0.64  (64%)
75-79: 0.65  (65%)
80-84: 0.66  (66%)
85+:   0.68  (68%)
```

### 3. Constants
- **Obsolescence Rate:** 0.25% per annum of existing housing stock
- **2022 Housing Stock:** 2,300,000 units (approximate from report context)
- **Historical Completions:** Available from housing report (for comparison overlay)

---

## User Controls (Interactive Inputs)

### Primary Controls

1. **Migration Scenario** (Radio buttons or dropdown)
   - M1 (Low Migration)
   - M2 (Baseline Migration) [Default]
   - M3 (High Migration)

2. **Headship Rate Assumption** (Slider or radio buttons)
   - Irish Current Rates (2022 baseline)
   - Gradual Convergence to UK (linear interpolation over 20 years)
   - Full UK Convergence (immediate)
   - Custom (advanced: allow users to adjust individual cohort rates)

3. **Projection Time Range** (Range slider)
   - Start Year: 2022-2040 [Default: 2024]
   - End Year: 2030-2057 [Default: 2050]

### Secondary Controls (Optional/Advanced)

4. **Obsolescence Rate Override** (Number input)
   - Default: 0.25%
   - Range: 0% - 0.5%

5. **Show Historical Context** (Toggle)
   - Overlays 2011-2023 actual completions and demand estimates

---

## Core Calculations

### For Each Year:

**Step 1: Calculate Total Households**
```
For each age cohort (15-19 through 85+):
  Household_Heads[cohort] = Population[cohort] × Headship_Rate[cohort]

Total_Households[year] = Sum of all Household_Heads[cohort]
```

**Step 2: Calculate Housing Stock Need**
```
If year == base_year (2022):
  Housing_Stock[year] = 2,300,000  // Starting stock
Else:
  Housing_Stock[year] = Housing_Stock[year-1] + Net_Change[year-1]
```

**Step 3: Calculate Annual Housing Requirement**
```
Household_Growth = Total_Households[year] - Total_Households[year-1]

Obsolescence_Units = Housing_Stock[year-1] × 0.0025

Annual_Housing_Need[year] = Household_Growth + Obsolescence_Units
```

**Step 4: Calculate Cumulative Gap (if showing historical data)**
```
Supply_Deficit[year] = Annual_Housing_Need[year] - Actual_Completions[year]
Cumulative_Deficit = Sum of all Supply_Deficit up to current year
```

---

## Visualization Outputs

### Primary Chart: Annual Housing Need Over Time
**Type:** Line chart with area fill

**X-Axis:** Year (2022-2057 or user-selected range)

**Y-Axis:** Housing units (0 - 80,000)

**Elements:**
- **Main line:** Projected annual housing need (based on user selections)
- **Reference line (dashed):** 52,000 units (report's central estimate)
- **Reference line (dashed):** 33,000 units (2023 actual supply level)
- **Shaded area (optional):** Range showing M1 vs M3 scenarios if user wants to see uncertainty
- **Historical overlay (if toggled):** 2011-2023 actual completions as bars

**Key Display Metrics (Summary boxes):**
- Average Annual Need (over projection period): [X] units
- Total Units Needed (cumulative): [X] units
- Gap vs 2023 Supply: [+X] units per year

### Secondary Chart: Household Formation by Age Cohort
**Type:** Stacked area chart

**Purpose:** Show which age groups are driving housing demand

**X-Axis:** Year

**Y-Axis:** Household formation (change in households)

**Stacks:** Each age cohort (15-19, 20-24, etc.) showing its contribution to annual demand

**Use:** Helps users understand demographic drivers (e.g., if 25-34 year olds are the main driver)

### Tertiary Display: Scenario Comparison Table
**Type:** Data table (optional panel)

Shows side-by-side comparison:
```
| Scenario | 2030 Need | 2040 Need | 2050 Need | Average |
|----------|-----------|-----------|-----------|---------|
| Current  | 45,000    | 48,000    | 50,000    | 47,000  |
| M1 Low   | 42,000    | 44,000    | 45,000    | 43,000  |
| M3 High  | 48,000    | 52,000    | 55,000    | 51,000  |
```

---

## Visual Design Notes

### Chart Style
- Clean, minimal design
- Use color to distinguish scenarios (blue for baseline, lighter blue for alternatives)
- Reference lines should be subtle but clear (dotted/dashed)
- Tooltips on hover showing exact values

### Color Palette Suggestion
- **Main projection line:** Deep blue (#1e3a8a)
- **52k reference:** Orange (#ea580c) 
- **33k reference:** Red (#dc2626)
- **Historical data:** Gray (#6b7280)
- **Area fills:** Low opacity versions of main colors

### Responsive Behavior
- Primary chart should be full-width
- Controls can be in a sidebar (desktop) or top panel (mobile)
- Key metrics always visible as "sticky" summary cards

---

## User Experience Flow

1. **Default View on Load:**
   - M2 (baseline migration) scenario
   - Irish current headship rates
   - 2024-2050 projection range
   - Shows 52k reference line prominently

2. **Exploration Path:**
   - User selects M3 (high migration) → Chart updates, shows higher demand
   - User toggles to UK convergence rates → Chart shows even higher demand
   - User can see that combination of M3 + UK convergence ≈ 60k+ units needed
   - User can toggle historical overlay to see current ~33k supply vs need

3. **Insight Generation:**
   - Clear visual gap between reference lines shows policy challenge
   - Demographic breakdown shows which age groups need housing
   - Scenario comparison shows range of uncertainty

---

## Technical Implementation Notes

### Data Processing
- Pre-calculate all scenarios on load (3 migration × 3 headship scenarios = 9 combinations)
- Store as JSON for fast chart updates
- Use lightweight charting library (e.g., Chart.js, Recharts, or Plotly)

### Performance
- Limit secondary chart to 5-year cohort groups (avoid 18 stacked areas)
- Debounce slider inputs
- Lazy-load historical data overlay


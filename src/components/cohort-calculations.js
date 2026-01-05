// Cohort-based housing demand calculation functions

// Constants
export const CONSTANTS = {
  BASE_HOUSING_STOCK: 2300000,
  DEFAULT_OBSOLESCENCE: 0.0025,
  REFERENCE_52K: 52000,
  REFERENCE_33K: 33000,
  CONVERGENCE_YEARS: 20,
  BASE_YEAR: 2022,
  DEFAULT_START_YEAR: 2024,
  DEFAULT_END_YEAR: 2050
};

// Cohorts in order for consistent iteration
export const COHORTS = [
  "15-19", "20-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60-64", "65-69", "70-74",
  "75-79", "80-84", "85+"
];

// Grouped cohorts for visualization (6 groups instead of 15)
export const COHORT_GROUPS = {
  "15-24": ["15-19", "20-24"],
  "25-34": ["25-29", "30-34"],
  "35-44": ["35-39", "40-44"],
  "45-54": ["45-49", "50-54"],
  "55-64": ["55-59", "60-64"],
  "65+": ["65-69", "70-74", "75-79", "80-84", "85+"]
};

/**
 * Interpolate headship rates for gradual convergence
 * Linear interpolation from current to UK rates over 20 years
 */
export function interpolateHeadshipRates(currentRates, ukRates, year) {
  const baseYear = CONSTANTS.BASE_YEAR;
  const convergenceYear = baseYear + CONSTANTS.CONVERGENCE_YEARS;

  if (year <= baseYear) {
    return { ...currentRates };
  }
  if (year >= convergenceYear) {
    return { ...ukRates };
  }

  // Linear interpolation
  const t = (year - baseYear) / (convergenceYear - baseYear);
  const result = {};

  for (const cohort of COHORTS) {
    const current = currentRates[cohort];
    const target = ukRates[cohort];
    result[cohort] = current + t * (target - current);
  }

  return result;
}

/**
 * Get headship rates for a given year and scenario
 */
export function getHeadshipRatesForYear(
  headshipScenario,
  currentRates,
  ukRates,
  year
) {
  switch (headshipScenario) {
    case "current":
      return { ...currentRates };
    case "gradual":
      return interpolateHeadshipRates(currentRates, ukRates, year);
    case "uk":
      return { ...ukRates };
    default:
      return { ...currentRates };
  }
}

/**
 * Calculate total households for a given year across all cohorts
 */
export function calculateTotalHouseholds(populationByCohort, headshipRates) {
  let total = 0;
  const byCohort = {};

  for (const cohort of COHORTS) {
    const population = populationByCohort[cohort] || 0;
    const rate = headshipRates[cohort] || 0;
    const households = population * rate;
    byCohort[cohort] = households;
    total += households;
  }

  return { total, byCohort };
}

/**
 * Calculate households grouped by age bands
 */
export function calculateHouseholdsByGroup(byCohort) {
  const byGroup = {};

  for (const [groupName, cohorts] of Object.entries(COHORT_GROUPS)) {
    byGroup[groupName] = cohorts.reduce((sum, cohort) => sum + (byCohort[cohort] || 0), 0);
  }

  return byGroup;
}

/**
 * Generate full time series for a scenario combination
 */
export function generateCohortTimeSeries(
  populationData,
  currentHeadshipRates,
  ukHeadshipRates,
  headshipScenario,
  obsolescenceRate,
  baseHousingStock
) {
  const years = Object.keys(populationData).map(Number).sort((a, b) => a - b);
  const results = [];

  let housingStock = baseHousingStock;
  let prevHouseholds = null;

  for (const year of years) {
    const headshipRates = getHeadshipRatesForYear(
      headshipScenario,
      currentHeadshipRates,
      ukHeadshipRates,
      year
    );

    const { total: totalHouseholds, byCohort } = calculateTotalHouseholds(
      populationData[year],
      headshipRates
    );

    const byGroup = calculateHouseholdsByGroup(byCohort);

    if (prevHouseholds !== null) {
      const householdGrowth = totalHouseholds - prevHouseholds;
      const obsolescence = housingStock * obsolescenceRate;
      const demand = householdGrowth + obsolescence;

      // Calculate growth by group (for stacked area chart)
      const prevByGroup = results[results.length - 1]?.byGroup || {};
      const growthByGroup = {};
      for (const group of Object.keys(COHORT_GROUPS)) {
        growthByGroup[group] = (byGroup[group] || 0) - (prevByGroup[group] || 0);
      }

      results.push({
        year,
        demand,
        householdGrowth,
        obsolescence,
        totalHouseholds,
        byGroup,
        growthByGroup
      });

      housingStock += demand;
    } else {
      // First year - just record state, no demand calculation
      results.push({
        year,
        demand: 0,
        householdGrowth: 0,
        obsolescence: 0,
        totalHouseholds,
        byGroup,
        growthByGroup: {}
      });
    }

    prevHouseholds = totalHouseholds;
  }

  // Remove the first year (base year with no demand)
  return results.slice(1);
}

/**
 * Pre-calculate all 9 scenario combinations
 */
export function generateAllCohortScenarios(
  populationProjections,
  currentHeadshipRates,
  ukHeadshipRates,
  obsolescenceRate,
  baseHousingStock
) {
  const scenarios = [];
  const migrationKeys = ["M1", "M2", "M3"];
  const headshipKeys = ["current", "gradual", "uk"];

  const headshipLabels = {
    current: "Irish Current",
    gradual: "Gradual Convergence",
    uk: "UK Rates"
  };

  for (const migKey of migrationKeys) {
    for (const headKey of headshipKeys) {
      const timeSeries = generateCohortTimeSeries(
        populationProjections[migKey].data,
        currentHeadshipRates,
        ukHeadshipRates,
        headKey,
        obsolescenceRate,
        baseHousingStock
      );

      scenarios.push({
        id: `${migKey}-${headKey}`,
        migration: migKey,
        headship: headKey,
        migrationLabel: populationProjections[migKey].label,
        headshipLabel: headshipLabels[headKey],
        timeSeries
      });
    }
  }

  return scenarios;
}

/**
 * Get min/max range across scenarios for each year
 */
export function getScenarioRange(allScenarios) {
  const yearMap = new Map();

  for (const scenario of allScenarios) {
    for (const point of scenario.timeSeries) {
      if (!yearMap.has(point.year)) {
        yearMap.set(point.year, { min: Infinity, max: -Infinity });
      }
      const range = yearMap.get(point.year);
      range.min = Math.min(range.min, point.demand);
      range.max = Math.max(range.max, point.demand);
    }
  }

  return Array.from(yearMap.entries())
    .map(([year, range]) => ({ year, min: range.min, max: range.max }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Calculate average demand for a time period
 */
export function calculatePeriodAverage(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length;
}

/**
 * Calculate total demand for a time period
 */
export function calculatePeriodTotal(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  return filtered.reduce((sum, d) => sum + d.demand, 0);
}

/**
 * Filter time series to a specific year range
 */
export function filterTimeSeries(timeSeries, startYear, endYear) {
  return timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
}

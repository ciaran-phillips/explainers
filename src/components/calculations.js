// Core housing demand calculation functions

/**
 * Calculate annual housing demand for a single year
 *
 * Formula from ESRI Report RS190:
 * Annual Housing Demand = New Households Formation + Replacement Stock
 *
 * Where:
 * - New Households = (Pop_t - Pop_t-1) × Headship_t + Pop_t-1 × (Headship_t - Headship_t-1)
 * - Replacement = Housing Stock × Obsolescence Rate
 */
export function calculateAnnualDemand(
  population,
  prevPopulation,
  headshipRate,
  prevHeadshipRate,
  housingStock,
  obsolescenceRate
) {
  // New household formation from population change
  const populationChange = population - prevPopulation;
  const newHouseholdsFromPopGrowth = populationChange * headshipRate;

  // New household formation from headship rate change (existing population forming new households)
  const headshipChange = headshipRate - prevHeadshipRate;
  const newHouseholdsFromHeadship = prevPopulation * headshipChange;

  // Total new households
  const newHouseholds = newHouseholdsFromPopGrowth + newHouseholdsFromHeadship;

  // Replacement stock (obsolescence)
  const replacement = housingStock * obsolescenceRate;

  return {
    total: newHouseholds + replacement,
    newHouseholds,
    replacement,
    populationChange,
    headshipChange
  };
}

/**
 * Generate time series for a given scenario combination
 */
export function generateScenarioTimeSeries(
  populationData,
  headshipData,
  obsolescenceRate,
  baseHousingStock
) {
  const years = Object.keys(populationData).map(Number).sort((a, b) => a - b);
  const results = [];

  // Start from 2023 (first year we can calculate demand)
  let currentStock = baseHousingStock;

  for (let i = 1; i < years.length; i++) {
    const year = years[i];
    const prevYear = years[i - 1];

    const demand = calculateAnnualDemand(
      populationData[year],
      populationData[prevYear],
      headshipData[year],
      headshipData[prevYear],
      currentStock,
      obsolescenceRate
    );

    results.push({
      year,
      demand: demand.total,
      newHouseholds: demand.newHouseholds,
      replacement: demand.replacement
    });

    // Update housing stock for next year (stock grows by new demand)
    currentStock += demand.total;
  }

  return results;
}

/**
 * Generate all 12 scenario combinations
 */
export function generateAllScenarios(
  populationProjections,
  headshipRates,
  obsolescenceScenarios,
  baseHousingStock
) {
  const scenarios = [];

  const popKeys = Object.keys(populationProjections);
  const headshipKeys = Object.keys(headshipRates);
  const obsKeys = Object.keys(obsolescenceScenarios);

  for (const popKey of popKeys) {
    for (const headshipKey of headshipKeys) {
      for (const obsKey of obsKeys) {
        const timeSeries = generateScenarioTimeSeries(
          populationProjections[popKey].data,
          headshipRates[headshipKey].data,
          obsolescenceScenarios[obsKey].rate,
          baseHousingStock
        );

        scenarios.push({
          id: `${popKey}-${headshipKey}-${obsKey}`,
          population: popKey,
          headship: headshipKey,
          obsolescence: obsKey,
          populationLabel: populationProjections[popKey].label,
          headshipLabel: headshipRates[headshipKey].label,
          obsolescenceLabel: obsolescenceScenarios[obsKey].label,
          timeSeries
        });
      }
    }
  }

  return scenarios;
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
 * Get min/max range across all scenarios for each year
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

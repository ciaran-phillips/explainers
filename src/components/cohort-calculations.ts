// Cohort-based housing demand calculation functions

import type {
  Cohort,
  CohortData,
  PopulationYear,
  PopulationProjections,
  Scenario as MigrationScenario
} from "../data/population-types.js";

export { type Cohort, type CohortData, type PopulationProjections, type MigrationScenario };

export const CONSTANTS = {
  BASE_HOUSING_STOCK: 2300000,
  DEFAULT_OBSOLESCENCE: 0.0025,
  REFERENCE_52K: 52000,
  REFERENCE_33K: 33000,
  FAST_CONVERGENCE: 11,
  SLOW_CONVERGENCE: 26,
  BASE_YEAR: 2022,
  DEFAULT_START_YEAR: 2024,
  DEFAULT_END_YEAR: 2050
} as const;

export const COHORTS = [
  "15-19", "20-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60-64", "65+"
] as const;

export type HeadshipRates = Record<Cohort, number>;
export type PopulationByCohort = CohortData;
export type PopulationData = Record<number, PopulationYear>;

export type HeadshipScenario = "current" | "gradual" | "fast";

export interface TimeSeriesPoint {
  year: number;
  demand: number;
  householdGrowth: number;
  obsolescence: number;
  totalHouseholds: number;
}

export interface Scenario {
  id: string;
  migration: MigrationScenario;
  headship: HeadshipScenario;
  migrationLabel: string;
  headshipLabel: string;
  timeSeries: TimeSeriesPoint[];
}

export interface ScenarioRangePoint {
  year: number;
  min: number;
  max: number;
}

// Linear interpolation from current to UK rates over 20 years
function interpolateHeadshipRates(
  currentRates: HeadshipRates,
  ukRates: HeadshipRates,
  year: number,
  convergencePeriod: number,
): HeadshipRates {
  const baseYear = CONSTANTS.BASE_YEAR;
  const convergenceYear = baseYear + convergencePeriod;

  if (year <= baseYear) {
    return { ...currentRates };
  }
  if (year >= convergenceYear) {
    return { ...ukRates };
  }

  const t = (year - baseYear) / (convergenceYear - baseYear);
  const result = {} as HeadshipRates;

  for (const cohort of COHORTS) {
    const current = currentRates[cohort];
    const target = ukRates[cohort];
    result[cohort] = current + t * (target - current);
  }

  return result;
}

function getHeadshipRatesForYear(
  headshipScenario: HeadshipScenario,
  currentRates: HeadshipRates,
  ukRates: HeadshipRates,
  year: number
): HeadshipRates {
  switch (headshipScenario) {
    case "current":
      return { ...currentRates };
    case "gradual":
      return interpolateHeadshipRates(currentRates, ukRates, year, CONSTANTS.SLOW_CONVERGENCE);
    case "fast":
      return interpolateHeadshipRates(currentRates, ukRates, year, CONSTANTS.FAST_CONVERGENCE);
    default:
      return { ...currentRates };
  }
}

export function calculateTotalHouseholds(
  populationByCohort: PopulationByCohort | undefined,
  headshipRates: HeadshipRates
) {
  if (!populationByCohort) return 0;

  let total = 0;

  for (const cohort of COHORTS) {
    const population = populationByCohort[cohort] || 0;
    const rate = headshipRates[cohort] || 0;
    const households = population * rate;
    total += households;
  }

  return total;
}

export function generateCohortTimeSeries(
  populationData: PopulationData,
  currentHeadshipRates: HeadshipRates,
  ukHeadshipRates: HeadshipRates,
  headshipScenario: HeadshipScenario,
  obsolescenceRate: number,
  baseHousingStock: number
): TimeSeriesPoint[] {
  const years = Object.keys(populationData).map(Number).sort((a, b) => a - b);
  const results: TimeSeriesPoint[] = [];

  let housingStock = baseHousingStock;
  let prevHouseholds: number | null = null;

  for (const year of years) {
    const headshipRates = getHeadshipRatesForYear(
      headshipScenario,
      currentHeadshipRates,
      ukHeadshipRates,
      year
    );

    const totalHouseholds = calculateTotalHouseholds(
      populationData[year].cohorts,
      headshipRates
    );

    if (prevHouseholds !== null) {
      const householdGrowth = totalHouseholds - prevHouseholds;
      const obsolescence = housingStock * obsolescenceRate;
      const demand = householdGrowth + obsolescence;

      results.push({
        year,
        demand,
        householdGrowth,
        obsolescence,
        totalHouseholds
      });

      housingStock += demand;
    } else {
      results.push({
        year,
        demand: 0,
        householdGrowth: 0,
        obsolescence: 0,
        totalHouseholds
      });
    }

    prevHouseholds = totalHouseholds;
  }

  return results.slice(1);
}

export function generateAllCohortScenarios(
  populationProjections: PopulationProjections,
  currentHeadshipRates: HeadshipRates,
  ukHeadshipRates: HeadshipRates,
  obsolescenceRate: number,
  baseHousingStock: number
): Scenario[] {
  const scenarios: Scenario[] = [];
  const migrationKeys: MigrationScenario[] = ["M1", "M2", "M3"];
  const headshipKeys: HeadshipScenario[] = ["current", "gradual", "fast"];

  const headshipLabels: Record<HeadshipScenario, string> = {
    current: "Irish Current",
    gradual: "Gradual Convergence",
    fast: "Fast Convergence"
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

export function getScenarioRange(allScenarios: Scenario[]): ScenarioRangePoint[] {
  const yearMap = new Map<number, { min: number; max: number }>();

  for (const scenario of allScenarios) {
    for (const point of scenario.timeSeries) {
      if (!yearMap.has(point.year)) {
        yearMap.set(point.year, { min: Infinity, max: -Infinity });
      }
      const range = yearMap.get(point.year)!;
      range.min = Math.min(range.min, point.demand);
      range.max = Math.max(range.max, point.demand);
    }
  }

  return Array.from(yearMap.entries())
    .map(([year, range]) => ({ year, min: range.min, max: range.max }))
    .sort((a, b) => a.year - b.year);
}

export function calculatePeriodAverage(
  timeSeries: TimeSeriesPoint[],
  startYear: number,
  endYear: number
): number {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length;
}

export function calculatePeriodTotal(
  timeSeries: TimeSeriesPoint[],
  startYear: number,
  endYear: number
): number {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  return filtered.reduce((sum, d) => sum + d.demand, 0);
}

export function filterTimeSeries(
  timeSeries: TimeSeriesPoint[],
  startYear: number,
  endYear: number
): TimeSeriesPoint[] {
  return timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
}

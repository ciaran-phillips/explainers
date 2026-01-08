// Cohort-based housing demand calculation functions

import type {
  Cohort,
  CohortData,
  PopulationYear,
  PopulationProjections,
  Scenario as MigrationScenario
} from "@/data/population-types";
import type { HeadshipYear, HeadshipProjections } from "@/data/headship-types";

export { type Cohort, type CohortData, type PopulationProjections, type MigrationScenario };
export { type HeadshipYear, type HeadshipProjections };

export const CONSTANTS = {
  BASE_HOUSING_STOCK: 2300000,
  DEFAULT_OBSOLESCENCE: 0.0025,
  REFERENCE_52K: 52000,
  REFERENCE_33K: 33000,
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
export type HeadshipData = Record<number, HeadshipYear>;

export type HeadshipScenarioKey = "current" | "gradual" | "fast";

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
  headship: HeadshipScenarioKey;
  migrationLabel: string;
  headshipLabel: string;
  timeSeries: TimeSeriesPoint[];
}

export interface ScenarioRangePoint {
  year: number;
  min: number;
  max: number;
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

/**
 * Generate time series using pre-computed headship rates
 * headshipData uses unified format: { [year]: { cohorts: {...} } }
 */
export function generateCohortTimeSeries(
  populationData: PopulationData,
  headshipData: HeadshipData,
  obsolescenceRate: number,
  baseHousingStock: number
): TimeSeriesPoint[] {
  const years = Object.keys(populationData).map(Number).sort((a, b) => a - b);
  const results: TimeSeriesPoint[] = [];

  let housingStock = baseHousingStock;
  let prevHouseholds: number | null = null;

  for (const year of years) {
    const headshipRates = headshipData[year]?.cohorts as HeadshipRates | undefined;

    const totalHouseholds = calculateTotalHouseholds(
      populationData[year].cohorts,
      headshipRates || ({} as HeadshipRates)
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
  headshipProjections: HeadshipProjections,
  obsolescenceRate: number,
  baseHousingStock: number
): Scenario[] {
  const scenarios: Scenario[] = [];
  const migrationKeys: MigrationScenario[] = ["M1", "M2", "M3"];
  const headshipKeys: HeadshipScenarioKey[] = ["current", "gradual", "fast"];

  for (const migKey of migrationKeys) {
    for (const headKey of headshipKeys) {
      const headshipScenario = headshipProjections[headKey];
      if (!headshipScenario) continue;

      const timeSeries = generateCohortTimeSeries(
        populationProjections[migKey].data,
        headshipScenario.data,
        obsolescenceRate,
        baseHousingStock
      );

      scenarios.push({
        id: `${migKey}-${headKey}`,
        migration: migKey,
        headship: headKey,
        migrationLabel: populationProjections[migKey].label,
        headshipLabel: headshipScenario.label,
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

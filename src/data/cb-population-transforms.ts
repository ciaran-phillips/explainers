// Transformation functions for CSO population data
// Converts individual age data to 5-year cohorts

export type Scenario = "M1" | "M2" | "M3";
export type CohortData = Record<string, number>;
export type YearData = Record<number, CohortData>;
export type ScenarioData = Record<Scenario, YearData>;

export interface ParsedRow {
  year: number;
  cohort: string;
  scenario: Scenario;
  population: number;
}

/**
 * Parse age string from CSO format to numeric age
 */
export function parseAge(ageString: string): number | null {
  if (ageString === "All ages") {
    return null;
  }
  if (ageString === "Under 1 year") {
    return 0;
  }
  if (ageString === "99 years and over") {
    return 99;
  }
  // Match patterns like "1 year", "15 years"
  const match = ageString.match(/^(\d+)\s+years?$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Map a numeric age to a 5-year cohort string
 */
export function ageToCohort(age: number): string {
  if (age >= 85) {
    return "85+";
  }
  const lowerBound = Math.floor(age / 5) * 5;
  const upperBound = lowerBound + 4;
  return `${lowerBound}-${upperBound}`;
}

/**
 * Extract scenario code from CSO criteria string
 */
export function parseScenario(criteriaString: string): Scenario | null {
  const match = criteriaString.match(/Method - (M[123])/);
  return match ? (match[1] as Scenario) : null;
}

/**
 * Parse a single CSV row from CSO format
 */
export function parseRow(values: string[]): ParsedRow | null {
  // Expected columns: Statistic Label, Year, Age, Sex, Criteria for Projection, UNIT, VALUE
  const year = parseInt(values[1], 10);
  const ageString = values[2];
  const scenario = parseScenario(values[4]);
  const population = parseInt(values[6], 10);

  const age = parseAge(ageString);
  if (age === null || scenario === null) {
    return null;
  }

  const cohort = ageToCohort(age);

  return { year, cohort, scenario, population };
}

/**
 * Aggregate parsed rows by scenario, year, and cohort
 */
export function aggregateByCohort(rows: (ParsedRow | null)[]): ScenarioData {
  const result: ScenarioData = {
    M1: {},
    M2: {},
    M3: {}
  };

  for (const row of rows) {
    if (!row) continue;

    const { year, cohort, scenario, population } = row;

    if (!result[scenario][year]) {
      result[scenario][year] = {};
    }

    if (!result[scenario][year][cohort]) {
      result[scenario][year][cohort] = 0;
    }

    result[scenario][year][cohort] += population;
  }

  return result;
}

// Cohorts that can form households (15+)
export const HOUSEHOLD_COHORTS = [
  "15-19", "20-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60-64", "65-69", "70-74",
  "75-79", "80-84", "85+"
] as const;

/**
 * Filter aggregated data to only include household-forming cohorts
 */
export function filterHouseholdCohorts(aggregated: ScenarioData): ScenarioData {
  const result: ScenarioData = {
    M1: {},
    M2: {},
    M3: {}
  };

  for (const scenario of Object.keys(aggregated) as Scenario[]) {
    const years = aggregated[scenario];
    for (const [yearStr, cohorts] of Object.entries(years)) {
      const year = parseInt(yearStr, 10);
      result[scenario][year] = {};
      for (const cohort of HOUSEHOLD_COHORTS) {
        if (cohorts[cohort] !== undefined) {
          result[scenario][year][cohort] = cohorts[cohort];
        }
      }
    }
  }

  return result;
}

// Transformation functions for CSO population data
// Converts individual age data to 5-year cohorts

/**
 * Parse age string from CSO format to numeric age
 * @param {string} ageString - e.g., "Under 1 year", "15 years", "99 years and over"
 * @returns {number|null} - numeric age, or null if should be skipped (e.g., "All ages")
 */
export function parseAge(ageString) {
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
 * @param {number} age - numeric age (0-99+)
 * @returns {string} - cohort string like "0-4", "15-19", "85+"
 */
export function ageToCohort(age) {
  if (age >= 85) {
    return "85+";
  }
  const lowerBound = Math.floor(age / 5) * 5;
  const upperBound = lowerBound + 4;
  return `${lowerBound}-${upperBound}`;
}

/**
 * Extract scenario code from CSO criteria string
 * @param {string} criteriaString - e.g., "Method - M1"
 * @returns {string} - scenario code like "M1"
 */
export function parseScenario(criteriaString) {
  const match = criteriaString.match(/Method - (M\d)/);
  return match ? match[1] : null;
}

/**
 * Parse a single CSV row from CSO format
 * @param {string[]} values - array of CSV values
 * @returns {object|null} - parsed row or null if should be skipped
 */
export function parseRow(values) {
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
 * @param {object[]} rows - array of parsed row objects
 * @returns {object} - nested object: { M1: { 2022: { "15-19": population, ... }, ... }, ... }
 */
export function aggregateByCohort(rows) {
  const result = {
    M1: {},
    M2: {},
    M3: {}
  };

  for (const row of rows) {
    if (!row) continue;

    const { year, cohort, scenario, population } = row;

    if (!result[scenario]) continue;

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
];

/**
 * Filter aggregated data to only include household-forming cohorts
 * @param {object} aggregated - output from aggregateByCohort
 * @returns {object} - filtered to only HOUSEHOLD_COHORTS
 */
export function filterHouseholdCohorts(aggregated) {
  const result = {};

  for (const [scenario, years] of Object.entries(aggregated)) {
    result[scenario] = {};
    for (const [year, cohorts] of Object.entries(years)) {
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

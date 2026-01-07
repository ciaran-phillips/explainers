// Central Bank headship rates data loader
// Pre-computes year-by-year cohort headship rates for each convergence scenario
// Outputs unified HeadshipYear format with cohort rates

import type { CohortData } from "./population-types.js";
import { HOUSEHOLD_COHORTS } from "./population-types.js";
import type { HeadshipProjections, HeadshipYear } from "./headship-types.js";
import { HEADSHIP_CONSTANTS } from "./headship-types.js";

// Source rates from cb-headship-rates-by-cohort.json
const CURRENT_RATES: CohortData = {
  "15-19": 0,
  "20-24": 0.15,
  "25-29": 0.263,
  "30-34": 0.397,
  "35-39": 0.466,
  "40-44": 0.502,
  "45-49": 0.527,
  "50-54": 0.55,
  "55-59": 0.564,
  "60-64": 0.579,
  "65+": 0.62
};

const UK_TARGET_RATES: CohortData = {
  "15-19": 0.03,
  "20-24": 0.15,
  "25-29": 0.38,
  "30-34": 0.52,
  "35-39": 0.56,
  "40-44": 0.58,
  "45-49": 0.59,
  "50-54": 0.60,
  "55-59": 0.61,
  "60-64": 0.62,
  "65+": 0.65
};

/** Interpolate cohort rates between current and target for a given year */
function interpolateCohortRates(
  currentRates: CohortData,
  targetRates: CohortData,
  year: number,
  convergenceYears: number
): CohortData {
  const { BASE_YEAR } = HEADSHIP_CONSTANTS;
  const convergenceYear = BASE_YEAR + convergenceYears;

  if (year <= BASE_YEAR) {
    return { ...currentRates };
  }
  if (year >= convergenceYear) {
    return { ...targetRates };
  }

  const t = (year - BASE_YEAR) / (convergenceYear - BASE_YEAR);
  const result = {} as CohortData;

  for (const cohort of HOUSEHOLD_COHORTS) {
    const current = currentRates[cohort];
    const target = targetRates[cohort];
    result[cohort] = current + t * (target - current);
  }

  return result;
}

/** Generate year-by-year cohort rates for a scenario */
function generateScenarioData(
  convergenceYears: number | null  // null = no convergence (static rates)
): Record<number, HeadshipYear> {
  const { BASE_YEAR, END_YEAR } = HEADSHIP_CONSTANTS;
  const result: Record<number, HeadshipYear> = {};

  for (let year = BASE_YEAR; year <= END_YEAR; year++) {
    const cohorts = convergenceYears === null
      ? { ...CURRENT_RATES }
      : interpolateCohortRates(CURRENT_RATES, UK_TARGET_RATES, year, convergenceYears);
    result[year] = { cohorts };
  }

  return result;
}

const headshipRates: HeadshipProjections = {
  current: {
    label: "Irish Current",
    description: "Headship rates stay at 2022 Irish levels",
    data: generateScenarioData(null)
  },
  gradual: {
    label: "Gradual Convergence",
    description: `Linear convergence to UK rates over ${HEADSHIP_CONSTANTS.GRADUAL_CONVERGENCE_YEARS} years (2022-${HEADSHIP_CONSTANTS.BASE_YEAR + HEADSHIP_CONSTANTS.GRADUAL_CONVERGENCE_YEARS})`,
    data: generateScenarioData(HEADSHIP_CONSTANTS.GRADUAL_CONVERGENCE_YEARS)
  },
  fast: {
    label: "Fast Convergence",
    description: `Linear convergence to UK rates over ${HEADSHIP_CONSTANTS.FAST_CONVERGENCE_YEARS} years (2022-${HEADSHIP_CONSTANTS.BASE_YEAR + HEADSHIP_CONSTANTS.FAST_CONVERGENCE_YEARS})`,
    data: generateScenarioData(HEADSHIP_CONSTANTS.FAST_CONVERGENCE_YEARS)
  }
};

process.stdout.write(JSON.stringify(headshipRates));

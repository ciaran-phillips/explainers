// Unified headship rate types
// Shared between ESRI and Central Bank data loaders

import type { Cohort, CohortData } from "./population-types.js";

export type { Cohort, CohortData };

/** Headship rates for a single year - either aggregate or by cohort */
export interface HeadshipYear {
  aggregate?: number;      // Single rate for the year (ESRI model)
  cohorts?: CohortData;    // Rates per age cohort (CB model)
}

export interface HeadshipScenario {
  label: string;
  description: string;
  data: Record<number, HeadshipYear>;
}

export type HeadshipProjections = Record<string, HeadshipScenario>;

// Convergence constants for CB headship rate interpolation
export const HEADSHIP_CONSTANTS = {
  BASE_YEAR: 2022,
  END_YEAR: 2057,
  FAST_CONVERGENCE_YEARS: 11,    // 2022-2033
  GRADUAL_CONVERGENCE_YEARS: 26  // 2022-2048
} as const;

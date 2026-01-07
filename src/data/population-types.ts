// Unified population projection types
// Shared between ESRI and Central Bank data loaders

export type Scenario = "M1" | "M2" | "M3";

export const HOUSEHOLD_COHORTS = [
  "15-19", "20-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60-64", "65+"
] as const;

export type Cohort = typeof HOUSEHOLD_COHORTS[number];

export type CohortData = Record<Cohort, number>;

export interface PopulationYear {
  total: number;
  cohorts?: CohortData;
}

export interface ScenarioOutput {
  label: string;
  description: string;
  data: Record<number, PopulationYear>;
}

export type PopulationProjections = Record<Scenario, ScenarioOutput>;

// Population by cohort data loader
// Reads CSV and outputs JSON grouped by scenario, year, and cohort
// Filters to only household-forming cohorts (15+)

import { readFileSync } from "fs";

const csv = readFileSync("src/data/cb-population-by-cohort.csv", "utf-8");
const lines = csv.trim().split("\n");
const headers = lines[0].split(",");

// Cohorts that can form households (15+)
const householdCohorts = [
  "15-19", "20-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60-64", "65-69", "70-74",
  "75-79", "80-84", "85+"
];

const result = {
  M1: {},
  M2: {},
  M3: {}
};

// Parse CSV rows
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(",");
  const year = parseInt(values[0]);
  const cohort = values[1];
  const scenario = values[2];
  const population = parseInt(values[3]);

  // Skip non-household-forming cohorts
  if (!householdCohorts.includes(cohort)) continue;

  // Initialize year object if needed
  if (!result[scenario][year]) {
    result[scenario][year] = {};
  }

  result[scenario][year][cohort] = population;
}

// Add metadata
const output = {
  M1: {
    label: "Low Migration",
    description: "M1 scenario - lower net migration",
    data: result.M1
  },
  M2: {
    label: "Baseline Migration",
    description: "M2 scenario - baseline net migration",
    data: result.M2
  },
  M3: {
    label: "High Migration",
    description: "M3 scenario - higher net migration",
    data: result.M3
  }
};

process.stdout.write(JSON.stringify(output));

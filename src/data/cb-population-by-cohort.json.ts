// Population by cohort data loader
// Reads CSO individual-age CSV and outputs JSON grouped by scenario, year, and cohort
// Filters to only household-forming cohorts (15+)

import { readFileSync } from "fs";
import {
  parseAge,
  ageToCohort,
  parseScenario,
  aggregateByCohort,
  filterHouseholdCohorts,
  type ParsedRow
} from "./cb-population-transforms.js";

const csv = readFileSync("src/data/cb-population-projections-all-years.csv", "utf-8");
const lines = csv.trim().split("\n");

// Parse CSV rows (skip header)
const parsedRows: (ParsedRow | null)[] = [];
for (let i = 1; i < lines.length; i++) {
  // Parse CSV with quoted fields
  const values = lines[i].match(/("([^"]*)"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, "")) || [];

  const year = parseInt(values[1], 10);
  const ageString = values[2];
  const scenario = parseScenario(values[4]);
  const population = parseInt(values[6], 10);

  const age = parseAge(ageString);
  if (age === null || scenario === null) continue;

  const cohort = ageToCohort(age);
  parsedRows.push({ year, cohort, scenario, population });
}

// Aggregate by cohort and filter to household-forming ages
const aggregated = aggregateByCohort(parsedRows);
const filtered = filterHouseholdCohorts(aggregated);

// Add metadata
const output = {
  M1: {
    label: "Low Migration",
    description: "M1 scenario - lower net migration",
    data: filtered.M1
  },
  M2: {
    label: "Baseline Migration",
    description: "M2 scenario - baseline net migration",
    data: filtered.M2
  },
  M3: {
    label: "High Migration",
    description: "M3 scenario - higher net migration",
    data: filtered.M3
  }
};

process.stdout.write(JSON.stringify(output));

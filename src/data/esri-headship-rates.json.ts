// Headship rates data loader
// Generates annual headship rates for each scenario (2022-2040) using linear interpolation
// Outputs unified HeadshipYear format with aggregate rates

import { readFileSync } from "fs";
import type { HeadshipProjections, HeadshipYear } from "./headship-types.js";

interface ScenarioInput {
  label: string;
  description: string;
  data: Record<string, number>;
}

interface ScenariosFile {
  headshipScenarios: Record<string, ScenarioInput>;
}

const scenarios: ScenariosFile = JSON.parse(readFileSync("src/data/esri-scenarios.json", "utf-8"));

function interpolate(data: Record<string, number>): Record<number, HeadshipYear> {
  const years = Object.keys(data).map(Number).sort((a, b) => a - b);
  const result: Record<number, HeadshipYear> = {};

  for (let year = years[0]; year <= years[years.length - 1]; year++) {
    let aggregate: number;
    if (data[year] !== undefined) {
      aggregate = data[year];
    } else {
      // Find surrounding years
      let lowerYear = years[0];
      let upperYear = years[years.length - 1];

      for (const y of years) {
        if (y < year) lowerYear = y;
        if (y > year && upperYear === years[years.length - 1]) upperYear = y;
      }

      // Linear interpolation
      const t = (year - lowerYear) / (upperYear - lowerYear);
      aggregate = data[lowerYear] + t * (data[upperYear] - data[lowerYear]);
    }
    result[year] = { aggregate };
  }

  return result;
}

const headshipRates: HeadshipProjections = {};

for (const [key, scenario] of Object.entries(scenarios.headshipScenarios)) {
  headshipRates[key] = {
    label: scenario.label,
    description: scenario.description,
    data: interpolate(scenario.data)
  };
}

process.stdout.write(JSON.stringify(headshipRates));

// Population projections data loader
// Generates annual population for each scenario (2022-2040) using linear interpolation

import { readFileSync } from "fs";

interface ScenarioInput {
  label: string;
  description: string;
  data: Record<string, number>;
}

interface ScenariosFile {
  populationScenarios: Record<string, ScenarioInput>;
}

interface ScenarioOutput {
  label: string;
  description: string;
  data: Record<number, number>;
}

const scenarios: ScenariosFile = JSON.parse(readFileSync("src/data/esri-scenarios.json", "utf-8"));

function interpolate(data: Record<string, number>): Record<number, number> {
  const years = Object.keys(data).map(Number).sort((a, b) => a - b);
  const result: Record<number, number> = {};

  for (let year = years[0]; year <= years[years.length - 1]; year++) {
    if (data[year] !== undefined) {
      result[year] = data[year];
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
      result[year] = data[lowerYear] + t * (data[upperYear] - data[lowerYear]);
    }
  }

  return result;
}

const populationProjections: Record<string, ScenarioOutput> = {};

for (const [key, scenario] of Object.entries(scenarios.populationScenarios)) {
  populationProjections[key] = {
    label: scenario.label,
    description: scenario.description,
    data: interpolate(scenario.data)
  };
}

process.stdout.write(JSON.stringify(populationProjections));

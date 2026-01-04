// Validation script to check calculations against ESRI Report Table 4.3
// Run with: node scripts/validate-calculations.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scenarios = JSON.parse(readFileSync(join(__dirname, '../src/data/scenarios.json'), 'utf-8'));

// Interpolation function (same as data loaders)
function interpolate(data) {
  const years = Object.keys(data).map(Number).sort((a, b) => a - b);
  const result = {};

  for (let year = years[0]; year <= years[years.length - 1]; year++) {
    if (data[year] !== undefined) {
      result[year] = data[year];
    } else {
      let lowerYear = years[0];
      let upperYear = years[years.length - 1];

      for (const y of years) {
        if (y < year) lowerYear = y;
        if (y > year && upperYear === years[years.length - 1]) upperYear = y;
      }

      const t = (year - lowerYear) / (upperYear - lowerYear);
      result[year] = data[lowerYear] + t * (data[upperYear] - data[lowerYear]);
    }
  }

  return result;
}

// Core calculation (same as calculations.js)
function calculateAnnualDemand(population, prevPopulation, headshipRate, prevHeadshipRate, housingStock, obsolescenceRate) {
  const populationChange = population - prevPopulation;
  const newHouseholdsFromPopGrowth = populationChange * headshipRate;
  const headshipChange = headshipRate - prevHeadshipRate;
  const newHouseholdsFromHeadship = prevPopulation * headshipChange;
  const newHouseholds = newHouseholdsFromPopGrowth + newHouseholdsFromHeadship;
  const replacement = housingStock * obsolescenceRate;

  return {
    total: newHouseholds + replacement,
    newHouseholds,
    replacement
  };
}

function generateScenarioTimeSeries(populationData, headshipData, obsolescenceRate, baseHousingStock) {
  const years = Object.keys(populationData).map(Number).sort((a, b) => a - b);
  const results = [];
  let currentStock = baseHousingStock;

  for (let i = 1; i < years.length; i++) {
    const year = years[i];
    const prevYear = years[i - 1];

    const demand = calculateAnnualDemand(
      populationData[year],
      populationData[prevYear],
      headshipData[year],
      headshipData[prevYear],
      currentStock,
      obsolescenceRate
    );

    results.push({
      year,
      demand: demand.total,
      newHouseholds: demand.newHouseholds,
      replacement: demand.replacement
    });

    currentStock += demand.total;
  }

  return results;
}

function calculatePeriodAverage(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length;
}

// Expected values from Table 4.3
const expectedValues = [
  { scenario: 1, pop: 'baseline', headship: 'current', obs: 'low', avg2023_2030: 37900, avg2030_2040: 32000 },
  { scenario: 2, pop: 'baseline', headship: 'current', obs: 'high', avg2023_2030: 42200, avg2030_2040: 37600 },
  { scenario: 3, pop: 'baseline', headship: 'falling', obs: 'low', avg2023_2030: 45800, avg2030_2040: 41600 },
  { scenario: 4, pop: 'baseline', headship: 'falling', obs: 'high', avg2023_2030: 50300, avg2030_2040: 47400 },
  { scenario: 5, pop: 'high', headship: 'current', obs: 'low', avg2023_2030: 40700, avg2030_2040: 36300 },
  { scenario: 6, pop: 'high', headship: 'current', obs: 'high', avg2023_2030: 45100, avg2030_2040: 41900 },
  { scenario: 7, pop: 'high', headship: 'falling', obs: 'low', avg2023_2030: 48900, avg2030_2040: 44200 },
  { scenario: 8, pop: 'high', headship: 'falling', obs: 'high', avg2023_2030: 53300, avg2030_2040: 52400 },
  { scenario: 9, pop: 'low', headship: 'current', obs: 'low', avg2023_2030: 35000, avg2030_2040: 27800 },
  { scenario: 10, pop: 'low', headship: 'current', obs: 'high', avg2023_2030: 39400, avg2030_2040: 33300 },
  { scenario: 11, pop: 'low', headship: 'falling', obs: 'low', avg2023_2030: 42800, avg2030_2040: 36700 },
  { scenario: 12, pop: 'low', headship: 'falling', obs: 'high', avg2023_2030: 47200, avg2030_2040: 42400 },
];

// Prepare data
const populationProjections = {};
for (const [key, scenario] of Object.entries(scenarios.populationScenarios)) {
  populationProjections[key] = interpolate(scenario.data);
}

const headshipRates = {};
for (const [key, scenario] of Object.entries(scenarios.headshipScenarios)) {
  headshipRates[key] = interpolate(scenario.data);
}

const baseHousingStock = scenarios.housingStock[2022];

console.log('Validating calculations against ESRI Report Table 4.3\n');
console.log('=' .repeat(90));
console.log('Scenario | Pop     | Headship | Obs  | Calc 23-30 | Exp 23-30 | Calc 30-40 | Exp 30-40 | Status');
console.log('=' .repeat(90));

let allPassed = true;
const tolerance = 2000; // Allow ±2000 difference (units are in thousands, so this is ±2k)

for (const expected of expectedValues) {
  const obsRate = scenarios.obsolescenceScenarios[expected.obs].rate;

  const timeSeries = generateScenarioTimeSeries(
    populationProjections[expected.pop],
    headshipRates[expected.headship],
    obsRate,
    baseHousingStock
  );

  // Multiply by 1000 since population/stock data is in thousands, output should be in units
  const calc2023_2030 = calculatePeriodAverage(timeSeries, 2023, 2030) * 1000;
  const calc2030_2040 = calculatePeriodAverage(timeSeries, 2031, 2040) * 1000;

  const diff1 = Math.abs(calc2023_2030 - expected.avg2023_2030);
  const diff2 = Math.abs(calc2030_2040 - expected.avg2030_2040);
  const passed = diff1 <= tolerance && diff2 <= tolerance;

  if (!passed) allPassed = false;

  console.log(
    `   ${expected.scenario.toString().padStart(2)}   | ${expected.pop.padEnd(7)} | ${expected.headship.padEnd(8)} | ${expected.obs.padEnd(4)} | ` +
    `${Math.round(calc2023_2030).toString().padStart(10)} | ${expected.avg2023_2030.toString().padStart(9)} | ` +
    `${Math.round(calc2030_2040).toString().padStart(10)} | ${expected.avg2030_2040.toString().padStart(9)} | ` +
    `${passed ? 'PASS' : 'FAIL'}`
  );
}

console.log('=' .repeat(90));
console.log(`\nOverall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
console.log(`Tolerance: ±${tolerance} units\n`);

// Also calculate overall averages
let allTimeSeries = [];
for (const expected of expectedValues) {
  const obsRate = scenarios.obsolescenceScenarios[expected.obs].rate;
  const timeSeries = generateScenarioTimeSeries(
    populationProjections[expected.pop],
    headshipRates[expected.headship],
    obsRate,
    baseHousingStock
  );
  allTimeSeries.push(timeSeries);
}

const avgAll2023_2030 = allTimeSeries.reduce((sum, ts) => sum + calculatePeriodAverage(ts, 2023, 2030), 0) / allTimeSeries.length * 1000;
const avgAll2030_2040 = allTimeSeries.reduce((sum, ts) => sum + calculatePeriodAverage(ts, 2031, 2040), 0) / allTimeSeries.length * 1000;

console.log('Overall averages:');
console.log(`  2023-2030: ${Math.round(avgAll2023_2030)} (expected: 44000)`);
console.log(`  2030-2040: ${Math.round(avgAll2030_2040)} (expected: 39700)`);

process.exit(allPassed ? 0 : 1);

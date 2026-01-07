import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateCohortTimeSeries,
  COHORTS,
  type Cohort,
  type HeadshipRates,
  type PopulationByCohort,
  type PopulationData,
  type HeadshipData
} from "./cohort-calculations.js";
import type { PopulationYear } from "../data/population-types.js";

function uniformRates(value: number): HeadshipRates {
  return Object.fromEntries(COHORTS.map((c: Cohort) => [c, value])) as HeadshipRates;
}

function uniformPopulation(value: number): PopulationByCohort {
  return Object.fromEntries(COHORTS.map((c: Cohort) => [c, value])) as PopulationByCohort;
}

function uniformPopulationYear(value: number): PopulationYear {
  const cohorts = uniformPopulation(value);
  const total = Object.values(cohorts).reduce((sum, pop) => sum + pop, 0);
  return { total, cohorts };
}

function uniformHeadshipData(rate: number, years: number[]): HeadshipData {
  const cohorts = uniformRates(rate);
  return Object.fromEntries(years.map(year => [year, { cohorts }])) as HeadshipData;
}

describe("generateCohortTimeSeries", () => {
  it("calculates demand from household growth and obsolescence", () => {
    // Population grows by 1000 per cohort per year
    const mockPopulation: PopulationData = {
      2022: uniformPopulationYear(10000),
      2023: uniformPopulationYear(11000),
      2024: uniformPopulationYear(12000),
    };

    // Uniform 0.5 headship rate for all cohorts and years
    const mockHeadshipData = uniformHeadshipData(0.5, [2022, 2023, 2024]);

    const obsolescenceRate = 0.01; // 1% for easy math
    const baseHousingStock = 100000;

    const result = generateCohortTimeSeries(
      mockPopulation,
      mockHeadshipData,
      obsolescenceRate,
      baseHousingStock
    );

    // Should return 2 years (2023, 2024) - first year is base
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].year, 2023);
    assert.strictEqual(result[1].year, 2024);

    // Year 2023:
    // Total households 2022: 11 cohorts * 10000 * 0.5 = 55,000
    // Total households 2023: 11 cohorts * 11000 * 0.5 = 60,500
    // Household growth: 60,500 - 55,000 = 5,500
    // Obsolescence: 100,000 * 0.01 = 1,000
    // Demand: 5,500 + 1,000 = 6,500
    assert.strictEqual(result[0].householdGrowth, 5500);
    assert.strictEqual(result[0].obsolescence, 1000);
    assert.strictEqual(result[0].demand, 6500);
    assert.strictEqual(result[0].totalHouseholds, 60500);

    // Year 2024:
    // Total households 2024: 11 * 12000 *.5 = 66000
    // Household growth: 60,500 - 55000 = 5500
    // Obsolescence: (100,000 + 6,500) * 0.01 = 1,065
    // Demand: 7,500 + 1,085 = 8,585
    assert.strictEqual(result[1].householdGrowth, 5500);
    assert.strictEqual(result[1].obsolescence, 1065);
    assert.strictEqual(result[1].demand, 6565);
  });
});

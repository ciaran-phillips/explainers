import { test, describe } from "node:test";
import assert from "node:assert";
import {
  parseAge,
  ageToCohort,
  parseScenario,
  parseRow,
  aggregateByCohort,
  filterHouseholdCohorts,
  HOUSEHOLD_COHORTS,
  type ParsedRow,
  type ScenarioData
} from "./cb-population-transforms.js";

describe("parseAge", () => {
  test("parses 'Under 1 year' as 0", () => {
    assert.strictEqual(parseAge("Under 1 year"), 0);
  });

  test("parses '1 year' as 1", () => {
    assert.strictEqual(parseAge("1 year"), 1);
  });

  test("parses '15 years' as 15", () => {
    assert.strictEqual(parseAge("15 years"), 15);
  });

  test("parses '99 years and over' as 99", () => {
    assert.strictEqual(parseAge("99 years and over"), 99);
  });

  test("returns null for 'All ages'", () => {
    assert.strictEqual(parseAge("All ages"), null);
  });

  test("parses two-digit ages correctly", () => {
    assert.strictEqual(parseAge("42 years"), 42);
    assert.strictEqual(parseAge("85 years"), 85);
  });
});

describe("ageToCohort", () => {
  test("maps ages 0-4 to '0-4'", () => {
    assert.strictEqual(ageToCohort(0), "0-4");
    assert.strictEqual(ageToCohort(4), "0-4");
  });

  test("maps ages 15-19 to '15-19'", () => {
    assert.strictEqual(ageToCohort(15), "15-19");
    assert.strictEqual(ageToCohort(19), "15-19");
  });

  test("maps ages 30-34 to '30-34'", () => {
    assert.strictEqual(ageToCohort(30), "30-34");
    assert.strictEqual(ageToCohort(34), "30-34");
  });

  test("maps ages 65+ to '65+'", () => {
    assert.strictEqual(ageToCohort(65), "65+");
    assert.strictEqual(ageToCohort(90), "65+");
    assert.strictEqual(ageToCohort(99), "65+");
  });
});

describe("parseScenario", () => {
  test("extracts M1 from 'Method - M1'", () => {
    assert.strictEqual(parseScenario("Method - M1"), "M1");
  });

  test("extracts M2 from 'Method - M2'", () => {
    assert.strictEqual(parseScenario("Method - M2"), "M2");
  });

  test("extracts M3 from 'Method - M3'", () => {
    assert.strictEqual(parseScenario("Method - M3"), "M3");
  });

  test("returns null for unrecognized format", () => {
    assert.strictEqual(parseScenario("Unknown"), null);
  });
});

describe("parseRow", () => {
  test("parses a valid CSO row", () => {
    const values = [
      "Population Projections based on Census 2022",
      "2022",
      "15 years",
      "Both sexes",
      "Method - M1",
      "Number",
      "70285"
    ];
    const result = parseRow(values);
    assert.deepStrictEqual(result, {
      year: 2022,
      cohort: "15-19",
      scenario: "M1",
      population: 70285
    });
  });

  test("returns null for 'All ages' row", () => {
    const values = [
      "Population Projections based on Census 2022",
      "2057",
      "All ages",
      "Both sexes",
      "Method - M1",
      "Number",
      "7005444"
    ];
    assert.strictEqual(parseRow(values), null);
  });

  test("handles 99 years and over as 65+ cohort", () => {
    const values = [
      "Population Projections based on Census 2022",
      "2057",
      "99 years and over",
      "Both sexes",
      "Method - M2",
      "Number",
      "10443"
    ];
    const result = parseRow(values);
    assert.ok(result !== null);
    assert.strictEqual(result.cohort, "65+");
    assert.strictEqual(result.scenario, "M2");
  });
});

describe("aggregateByCohort", () => {
  test("aggregates multiple ages into same cohort", () => {
    const rows: ParsedRow[] = [
      { year: 2022, cohort: "15-19", scenario: "M1", population: 100 },
      { year: 2022, cohort: "15-19", scenario: "M1", population: 200 },
      { year: 2022, cohort: "15-19", scenario: "M1", population: 150 }
    ];
    const result = aggregateByCohort(rows);
    assert.strictEqual(result.M1[2022]["15-19"], 450);
  });

  test("keeps scenarios separate", () => {
    const rows: ParsedRow[] = [
      { year: 2022, cohort: "20-24", scenario: "M1", population: 100 },
      { year: 2022, cohort: "20-24", scenario: "M2", population: 200 }
    ];
    const result = aggregateByCohort(rows);
    assert.strictEqual(result.M1[2022]["20-24"], 100);
    assert.strictEqual(result.M2[2022]["20-24"], 200);
  });

  test("keeps years separate", () => {
    const rows: ParsedRow[] = [
      { year: 2022, cohort: "25-29", scenario: "M1", population: 100 },
      { year: 2023, cohort: "25-29", scenario: "M1", population: 150 }
    ];
    const result = aggregateByCohort(rows);
    assert.strictEqual(result.M1[2022]["25-29"], 100);
    assert.strictEqual(result.M1[2023]["25-29"], 150);
  });

  test("skips null rows", () => {
    const rows: (ParsedRow | null)[] = [
      { year: 2022, cohort: "30-34", scenario: "M1", population: 100 },
      null,
      { year: 2022, cohort: "30-34", scenario: "M1", population: 50 }
    ];
    const result = aggregateByCohort(rows);
    assert.strictEqual(result.M1[2022]["30-34"], 150);
  });
});

describe("filterHouseholdCohorts", () => {
  test("removes cohorts under 15", () => {
    const aggregated: ScenarioData = {
      M1: {
        2022: {
          "0-4": 100,
          "5-9": 200,
          "10-14": 300,
          "15-19": 400,
          "20-24": 500
        }
      },
      M2: {},
      M3: {}
    };
    const result = filterHouseholdCohorts(aggregated);
    assert.strictEqual(result.M1[2022]["0-4"], undefined);
    assert.strictEqual(result.M1[2022]["5-9"], undefined);
    assert.strictEqual(result.M1[2022]["10-14"], undefined);
    assert.strictEqual(result.M1[2022]["15-19"], 400);
    assert.strictEqual(result.M1[2022]["20-24"], 500);
  });
});

describe("integration: verify cohort sums match expected values", () => {
  test("ages 0-4 sum correctly (Under 1 year + 1 year + 2 years + 3 years + 4 years)", () => {
    // From the actual CSV data for 2022, M1:
    // Under 1 year: 57684, 1 year: 56631, 2 years: 59250, 3 years: 60596, 4 years: 61673
    // Expected sum: 295834 (matches cb-population-by-cohort.csv)
    const rows: ParsedRow[] = [
      { year: 2022, cohort: "0-4", scenario: "M1", population: 57684 },
      { year: 2022, cohort: "0-4", scenario: "M1", population: 56631 },
      { year: 2022, cohort: "0-4", scenario: "M1", population: 59250 },
      { year: 2022, cohort: "0-4", scenario: "M1", population: 60596 },
      { year: 2022, cohort: "0-4", scenario: "M1", population: 61673 }
    ];
    const result = aggregateByCohort(rows);
    assert.strictEqual(result.M1[2022]["0-4"], 295834);
  });
});

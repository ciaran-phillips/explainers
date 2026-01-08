/**
 * Data generation script
 * Converts Observable data loaders to static JSON files
 * Run with: npm run generate-data
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')
const SRC_DATA_DIR = join(ROOT_DIR, 'src/data')
const OUTPUT_DIR = join(ROOT_DIR, 'public/data')

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Type definitions (inline to avoid import issues with paths)
type Scenario = 'M1' | 'M2' | 'M3'
type Cohort = '15-19' | '20-24' | '25-29' | '30-34' | '35-39' | '40-44' | '45-49' | '50-54' | '55-59' | '60-64' | '65+'
type CohortData = Record<Cohort, number>

interface PopulationYear {
  total: number
  cohorts?: CohortData
}

interface ScenarioOutput {
  label: string
  description: string
  data: Record<number, PopulationYear>
}

type PopulationProjections = Record<string, ScenarioOutput>

interface HeadshipYear {
  aggregate?: number
  cohorts?: CohortData
}

interface HeadshipScenario {
  label: string
  description: string
  data: Record<number, HeadshipYear>
}

type HeadshipProjections = Record<string, HeadshipScenario>

interface ScenarioInput {
  label: string
  description: string
  data: Record<string, number>
}

interface ScenariosFile {
  populationScenarios: Record<string, ScenarioInput>
  headshipScenarios: Record<string, ScenarioInput>
}

// Cohorts for household formation (15+)
const HOUSEHOLD_COHORTS: readonly Cohort[] = [
  '15-19', '20-24', '25-29', '30-34', '35-39', '40-44',
  '45-49', '50-54', '55-59', '60-64', '65+'
]

// Headship constants
const HEADSHIP_CONSTANTS = {
  BASE_YEAR: 2022,
  END_YEAR: 2057,
  FAST_CONVERGENCE_YEARS: 11,
  GRADUAL_CONVERGENCE_YEARS: 26
}

// ============================================================================
// Helper functions (from cb-population-transforms.ts)
// ============================================================================

function parseAge(ageString: string): number | null {
  if (ageString === 'All ages') return null
  if (ageString === 'Under 1 year') return 0
  if (ageString === '99 years and over') return 99
  const match = ageString.match(/^(\d+)\s+years?$/)
  return match ? parseInt(match[1], 10) : null
}

function ageToCohort(age: number): string {
  if (age >= 65) return '65+'
  const lowerBound = Math.floor(age / 5) * 5
  return `${lowerBound}-${lowerBound + 4}`
}

function parseScenario(criteriaString: string): Scenario | null {
  const match = criteriaString.match(/Method - (M[123])/)
  return match ? (match[1] as Scenario) : null
}

// ============================================================================
// ESRI Population Projections Generator
// ============================================================================

function generateEsriPopulationProjections(): PopulationProjections {
  const scenarios: ScenariosFile = JSON.parse(
    readFileSync(join(SRC_DATA_DIR, 'esri-scenarios.json'), 'utf-8')
  )

  function interpolate(data: Record<string, number>): Record<number, PopulationYear> {
    const years = Object.keys(data).map(Number).sort((a, b) => a - b)
    const result: Record<number, PopulationYear> = {}

    for (let year = years[0]; year <= years[years.length - 1]; year++) {
      let total: number
      if (data[year] !== undefined) {
        total = data[year]
      } else {
        let lowerYear = years[0]
        let upperYear = years[years.length - 1]
        for (const y of years) {
          if (y < year) lowerYear = y
          if (y > year && upperYear === years[years.length - 1]) upperYear = y
        }
        const t = (year - lowerYear) / (upperYear - lowerYear)
        total = data[lowerYear] + t * (data[upperYear] - data[lowerYear])
      }
      result[year] = { total }
    }
    return result
  }

  const populationProjections: PopulationProjections = {}
  for (const [key, scenario] of Object.entries(scenarios.populationScenarios)) {
    populationProjections[key] = {
      label: scenario.label,
      description: scenario.description,
      data: interpolate(scenario.data)
    }
  }

  return populationProjections
}

// ============================================================================
// ESRI Headship Rates Generator
// ============================================================================

function generateEsriHeadshipRates(): HeadshipProjections {
  const scenarios: ScenariosFile = JSON.parse(
    readFileSync(join(SRC_DATA_DIR, 'esri-scenarios.json'), 'utf-8')
  )

  function interpolate(data: Record<string, number>): Record<number, HeadshipYear> {
    const years = Object.keys(data).map(Number).sort((a, b) => a - b)
    const result: Record<number, HeadshipYear> = {}

    for (let year = years[0]; year <= years[years.length - 1]; year++) {
      let aggregate: number
      if (data[year] !== undefined) {
        aggregate = data[year]
      } else {
        let lowerYear = years[0]
        let upperYear = years[years.length - 1]
        for (const y of years) {
          if (y < year) lowerYear = y
          if (y > year && upperYear === years[years.length - 1]) upperYear = y
        }
        const t = (year - lowerYear) / (upperYear - lowerYear)
        aggregate = data[lowerYear] + t * (data[upperYear] - data[lowerYear])
      }
      result[year] = { aggregate }
    }
    return result
  }

  const headshipRates: HeadshipProjections = {}
  for (const [key, scenario] of Object.entries(scenarios.headshipScenarios)) {
    headshipRates[key] = {
      label: scenario.label,
      description: scenario.description,
      data: interpolate(scenario.data)
    }
  }

  return headshipRates
}

// ============================================================================
// Central Bank Population by Cohort Generator
// ============================================================================

function generateCbPopulationByCohort(): PopulationProjections {
  const csv = readFileSync(join(SRC_DATA_DIR, 'cb-population-projections-all-years.csv'), 'utf-8')
  const lines = csv.trim().split('\n')

  type ScenarioData = Record<Scenario, Record<number, Record<string, number>>>

  const aggregated: ScenarioData = { M1: {}, M2: {}, M3: {} }

  // Parse and aggregate
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/("([^"]*)"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, '')) || []

    const year = parseInt(values[1], 10)
    const ageString = values[2]
    const scenario = parseScenario(values[4])
    const population = parseInt(values[6], 10)

    const age = parseAge(ageString)
    if (age === null || scenario === null) continue

    const cohort = ageToCohort(age)

    if (!aggregated[scenario][year]) {
      aggregated[scenario][year] = {}
    }
    if (!aggregated[scenario][year][cohort]) {
      aggregated[scenario][year][cohort] = 0
    }
    aggregated[scenario][year][cohort] += population
  }

  // Filter to household cohorts and convert format
  function toPopulationData(yearData: Record<number, Record<string, number>>): Record<number, PopulationYear> {
    const result: Record<number, PopulationYear> = {}
    for (const [yearStr, cohorts] of Object.entries(yearData)) {
      const year = parseInt(yearStr, 10)
      const filteredCohorts: Record<string, number> = {}
      let total = 0

      for (const cohort of HOUSEHOLD_COHORTS) {
        if (cohorts[cohort] !== undefined) {
          filteredCohorts[cohort] = cohorts[cohort]
          total += cohorts[cohort]
        }
      }

      result[year] = { total, cohorts: filteredCohorts as CohortData }
    }
    return result
  }

  return {
    M1: {
      label: 'Low Migration',
      description: 'M1 scenario - lower net migration',
      data: toPopulationData(aggregated.M1)
    },
    M2: {
      label: 'Baseline Migration',
      description: 'M2 scenario - baseline net migration',
      data: toPopulationData(aggregated.M2)
    },
    M3: {
      label: 'High Migration',
      description: 'M3 scenario - higher net migration',
      data: toPopulationData(aggregated.M3)
    }
  }
}

// ============================================================================
// Central Bank Headship Rates Generator
// ============================================================================

function generateCbHeadshipRates(): HeadshipProjections {
  const CURRENT_RATES: CohortData = {
    '15-19': 0,
    '20-24': 0.15,
    '25-29': 0.263,
    '30-34': 0.397,
    '35-39': 0.466,
    '40-44': 0.502,
    '45-49': 0.527,
    '50-54': 0.55,
    '55-59': 0.564,
    '60-64': 0.579,
    '65+': 0.62
  }

  const UK_TARGET_RATES: CohortData = {
    '15-19': 0.03,
    '20-24': 0.15,
    '25-29': 0.38,
    '30-34': 0.52,
    '35-39': 0.56,
    '40-44': 0.58,
    '45-49': 0.59,
    '50-54': 0.60,
    '55-59': 0.61,
    '60-64': 0.62,
    '65+': 0.65
  }

  function interpolateCohortRates(
    currentRates: CohortData,
    targetRates: CohortData,
    year: number,
    convergenceYears: number
  ): CohortData {
    const { BASE_YEAR } = HEADSHIP_CONSTANTS
    const convergenceYear = BASE_YEAR + convergenceYears

    if (year <= BASE_YEAR) return { ...currentRates }
    if (year >= convergenceYear) return { ...targetRates }

    const t = (year - BASE_YEAR) / (convergenceYear - BASE_YEAR)
    const result = {} as CohortData

    for (const cohort of HOUSEHOLD_COHORTS) {
      const current = currentRates[cohort]
      const target = targetRates[cohort]
      result[cohort] = current + t * (target - current)
    }

    return result
  }

  function generateScenarioData(convergenceYears: number | null): Record<number, HeadshipYear> {
    const { BASE_YEAR, END_YEAR } = HEADSHIP_CONSTANTS
    const result: Record<number, HeadshipYear> = {}

    for (let year = BASE_YEAR; year <= END_YEAR; year++) {
      const cohorts = convergenceYears === null
        ? { ...CURRENT_RATES }
        : interpolateCohortRates(CURRENT_RATES, UK_TARGET_RATES, year, convergenceYears)
      result[year] = { cohorts }
    }

    return result
  }

  return {
    current: {
      label: 'Irish Current',
      description: 'Headship rates stay at 2022 Irish levels',
      data: generateScenarioData(null)
    },
    gradual: {
      label: 'Gradual Convergence',
      description: `Linear convergence to UK rates over ${HEADSHIP_CONSTANTS.GRADUAL_CONVERGENCE_YEARS} years`,
      data: generateScenarioData(HEADSHIP_CONSTANTS.GRADUAL_CONVERGENCE_YEARS)
    },
    fast: {
      label: 'Fast Convergence',
      description: `Linear convergence to UK rates over ${HEADSHIP_CONSTANTS.FAST_CONVERGENCE_YEARS} years`,
      data: generateScenarioData(HEADSHIP_CONSTANTS.FAST_CONVERGENCE_YEARS)
    }
  }
}

// ============================================================================
// Main execution
// ============================================================================

console.log('Generating data files...')

const generators = [
  { name: 'esri-population-projections.json', fn: generateEsriPopulationProjections },
  { name: 'esri-headship-rates.json', fn: generateEsriHeadshipRates },
  { name: 'cb-population-by-cohort.json', fn: generateCbPopulationByCohort },
  { name: 'cb-headship-rates.json', fn: generateCbHeadshipRates }
]

for (const { name, fn } of generators) {
  const data = fn()
  const outputPath = join(OUTPUT_DIR, name)
  writeFileSync(outputPath, JSON.stringify(data, null, 2))
  console.log(`  Generated ${name}`)
}

// Copy static JSON files
const staticFiles = ['esri-scenarios.json']
for (const file of staticFiles) {
  const srcPath = join(SRC_DATA_DIR, file)
  const destPath = join(OUTPUT_DIR, file)
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath)
    console.log(`  Copied ${file}`)
  }
}

console.log('Done!')

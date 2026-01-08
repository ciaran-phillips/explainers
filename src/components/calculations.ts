// Core housing demand calculation functions

import type { PopulationYear, ScenarioOutput, Scenario } from '@/data/population-types'
import type { HeadshipProjections, HeadshipYear, HeadshipScenario } from '@/data/headship-types'

// More flexible type that accepts any string keys (for runtime iteration)
export type PopulationProjectionsFlexible = Record<string, ScenarioOutput>

export interface DemandResult {
  total: number
  newHouseholds: number
  replacement: number
  populationChange: number
  headshipChange: number
}

export interface TimeSeriesPoint {
  year: number
  demand: number
  newHouseholds: number
  replacement: number
}

export interface RangePoint {
  year: number
  min: number
  max: number
}

export interface ScenarioResult {
  id: string
  population: string
  headship: string
  obsolescence: string
  populationLabel: string
  headshipLabel: string
  obsolescenceLabel: string
  timeSeries: TimeSeriesPoint[]
}

export interface ObsolescenceScenario {
  label: string
  rate: number
}

/**
 * Calculate annual housing demand for a single year
 */
export function calculateAnnualDemand(
  population: number,
  prevPopulation: number,
  headshipRate: number,
  prevHeadshipRate: number,
  housingStock: number,
  obsolescenceRate: number
): DemandResult {
  const populationChange = population - prevPopulation
  const newHouseholdsFromPopGrowth = populationChange * headshipRate
  const headshipChange = headshipRate - prevHeadshipRate
  const newHouseholdsFromHeadship = prevPopulation * headshipChange
  const newHouseholds = newHouseholdsFromPopGrowth + newHouseholdsFromHeadship
  const replacement = housingStock * obsolescenceRate

  return {
    total: newHouseholds + replacement,
    newHouseholds,
    replacement,
    populationChange,
    headshipChange
  }
}

/**
 * Generate time series for a given scenario combination
 */
export function generateScenarioTimeSeries(
  populationData: Record<number, PopulationYear>,
  headshipData: Record<number, HeadshipYear>,
  obsolescenceRate: number,
  baseHousingStock: number
): TimeSeriesPoint[] {
  const years = Object.keys(populationData).map(Number).sort((a, b) => a - b)
  const results: TimeSeriesPoint[] = []

  let currentStock = baseHousingStock

  for (let i = 1; i < years.length; i++) {
    const year = years[i]
    const prevYear = years[i - 1]

    const demand = calculateAnnualDemand(
      populationData[year].total,
      populationData[prevYear].total,
      headshipData[year].aggregate!,
      headshipData[prevYear].aggregate!,
      currentStock,
      obsolescenceRate
    )

    results.push({
      year,
      demand: demand.total,
      newHouseholds: demand.newHouseholds,
      replacement: demand.replacement
    })

    currentStock += demand.total
  }

  return results
}

/**
 * Generate all scenario combinations
 */
export function generateAllScenarios(
  populationProjections: PopulationProjectionsFlexible,
  headshipRates: HeadshipProjections,
  obsolescenceScenarios: Record<string, ObsolescenceScenario>,
  baseHousingStock: number
): ScenarioResult[] {
  const scenarios: ScenarioResult[] = []

  const popKeys = Object.keys(populationProjections)
  const headshipKeys = Object.keys(headshipRates)
  const obsKeys = Object.keys(obsolescenceScenarios)

  for (const popKey of popKeys) {
    for (const headshipKey of headshipKeys) {
      for (const obsKey of obsKeys) {
        const timeSeries = generateScenarioTimeSeries(
          populationProjections[popKey].data,
          headshipRates[headshipKey].data,
          obsolescenceScenarios[obsKey].rate,
          baseHousingStock
        )

        scenarios.push({
          id: `${popKey}-${headshipKey}-${obsKey}`,
          population: popKey,
          headship: headshipKey,
          obsolescence: obsKey,
          populationLabel: populationProjections[popKey].label,
          headshipLabel: headshipRates[headshipKey].label,
          obsolescenceLabel: obsolescenceScenarios[obsKey].label,
          timeSeries
        })
      }
    }
  }

  return scenarios
}

/**
 * Calculate average demand for a time period
 */
export function calculatePeriodAverage(
  timeSeries: { year: number; demand: number }[],
  startYear: number,
  endYear: number
): number {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear)
  if (filtered.length === 0) return 0
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length
}

/**
 * Calculate total demand for a time period
 */
export function calculatePeriodTotal(
  timeSeries: { year: number; demand: number }[],
  startYear: number,
  endYear: number
): number {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear)
  return filtered.reduce((sum, d) => sum + d.demand, 0)
}

/**
 * Get min/max range across all scenarios for each year
 */
export function getScenarioRange(allScenarios: ScenarioResult[]): RangePoint[] {
  const yearMap = new Map<number, { min: number; max: number }>()

  for (const scenario of allScenarios) {
    for (const point of scenario.timeSeries) {
      if (!yearMap.has(point.year)) {
        yearMap.set(point.year, { min: Infinity, max: -Infinity })
      }
      const range = yearMap.get(point.year)!
      range.min = Math.min(range.min, point.demand)
      range.max = Math.max(range.max, point.demand)
    }
  }

  return Array.from(yearMap.entries())
    .map(([year, range]) => ({ year, min: range.min, max: range.max }))
    .sort((a, b) => a.year - b.year)
}

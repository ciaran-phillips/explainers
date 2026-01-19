import {
  CONSTANTS,
  generateCohortTimeSeries,
  generateAllCohortScenarios,
  getScenarioRange,
  type PopulationProjections,
  type HeadshipProjections,
  type TimeSeriesPoint
} from '@/components/cohort-calculations'
import type { CentralBankFilterState } from '@/components/filters/types'

export interface CentralBankRangePoint {
  year: number
  min: number
  max: number
}

export interface CentralBankTimeSeriesResult {
  selectedTimeSeries: TimeSeriesPoint[]
  scenarioRange: CentralBankRangePoint[]
  chartConfig: {
    yearDomain: [number, number]
    yDomain: [number, number]
    periodBreak: number
    scale: number
  }
}

export function computeCentralBankTimeSeries(
  populationByCohort: PopulationProjections,
  headshipRates: HeadshipProjections,
  filters: CentralBankFilterState
): CentralBankTimeSeriesResult {
  const allScenarios = generateAllCohortScenarios(
    populationByCohort,
    headshipRates,
    CONSTANTS.DEFAULT_OBSOLESCENCE,
    CONSTANTS.BASE_HOUSING_STOCK
  )

  const scenarioRange = getScenarioRange(allScenarios)

  const selectedTimeSeries = generateCohortTimeSeries(
    populationByCohort[filters.migration].data,
    headshipRates[filters.headship].data,
    filters.obsolescence,
    CONSTANTS.BASE_HOUSING_STOCK
  )

  return {
    selectedTimeSeries,
    scenarioRange,
    chartConfig: {
      yearDomain: [2023, 2050],
      yDomain: [0, 80000],
      periodBreak: 2035,
      scale: 1
    }
  }
}

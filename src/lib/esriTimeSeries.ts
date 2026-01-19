import type { ScenariosFile } from '@/lib/dataLoader'
import type { HeadshipProjections } from '@/data/headship-types'
import {
  generateScenarioTimeSeries,
  generateAllScenarios,
  getScenarioRange,
  type PopulationProjectionsFlexible,
  type TimeSeriesPoint,
  type RangePoint
} from '@/components/calculations'
import type { EsriFilterState, RadioOption } from '@/components/filters/types'

export interface EsriFilterOptions {
  migration: RadioOption[]
  headship: RadioOption[]
  obsolescence: RadioOption[]
}

export interface EsriTimeSeriesResult {
  selectedTimeSeries: TimeSeriesPoint[]
  scenarioRange: RangePoint[]
  filterOptions: EsriFilterOptions
  chartConfig: {
    yearDomain: [number, number]
    yDomain: [number, number]
    periodBreak: number
    scale: number
  }
}

export function computeEsriTimeSeries(
  scenarios: ScenariosFile,
  populationProjections: PopulationProjectionsFlexible,
  headshipRates: HeadshipProjections,
  filters: EsriFilterState
): EsriTimeSeriesResult {
  const migrationOptions = Object.entries(scenarios.populationScenarios).map(([key, value]) => ({
    value: key,
    label: value.label
  }))

  const headshipOptions = Object.entries(scenarios.headshipScenarios).map(([key, value]) => ({
    value: key,
    label: value.label
  }))

  const obsolescenceOptions = Object.entries(scenarios.obsolescenceScenarios).map(([key, value]) => ({
    value: key,
    label: value.label
  }))

  const allScenarios = generateAllScenarios(
    populationProjections,
    headshipRates,
    scenarios.obsolescenceScenarios,
    scenarios.housingStock[2022]
  )

  const scenarioRange = getScenarioRange(allScenarios)

  const selectedTimeSeries = generateScenarioTimeSeries(
    populationProjections[filters.migration]?.data || Object.values(populationProjections)[0].data,
    headshipRates[filters.headship]?.data || Object.values(headshipRates)[0].data,
    scenarios.obsolescenceScenarios[filters.obsolescence]?.rate || 0.0025,
    scenarios.housingStock[2022]
  )

  return {
    selectedTimeSeries,
    scenarioRange,
    filterOptions: {
      migration: migrationOptions,
      headship: headshipOptions,
      obsolescence: obsolescenceOptions
    },
    chartConfig: {
      yearDomain: [2023, 2040],
      yDomain: [0, 80000],
      periodBreak: 2030,
      scale: 1000
    }
  }
}

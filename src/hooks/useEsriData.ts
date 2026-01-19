import { dataLoaders, type ScenariosFile } from '@/lib/dataLoader'
import type { PopulationProjectionsFlexible } from '@/components/calculations'
import type { HeadshipProjections } from '@/data/headship-types'
import { useAsyncData } from './useAsyncData'

interface EsriData {
  scenarios: ScenariosFile
  populationProjections: PopulationProjectionsFlexible
  headshipRates: HeadshipProjections
}

export interface EsriDataResult {
  loading: boolean
  error: Error | null
  scenarios: ScenariosFile | null
  populationProjections: PopulationProjectionsFlexible | null
  headshipRates: HeadshipProjections | null
}

async function loadEsriData(): Promise<EsriData> {
  const [scenarios, populationProjections, headshipRates] = await Promise.all([
    dataLoaders.esriScenarios(),
    dataLoaders.esriPopulation(),
    dataLoaders.esriHeadship()
  ])
  return {
    scenarios,
    populationProjections: populationProjections as PopulationProjectionsFlexible,
    headshipRates
  }
}

export function useEsriData(): EsriDataResult {
  const { loading, error, data } = useAsyncData(loadEsriData)

  return {
    loading,
    error,
    scenarios: data?.scenarios ?? null,
    populationProjections: data?.populationProjections ?? null,
    headshipRates: data?.headshipRates ?? null
  }
}

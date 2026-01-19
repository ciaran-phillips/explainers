import { dataLoaders } from '@/lib/dataLoader'
import type { PopulationProjections, HeadshipProjections } from '@/components/cohort-calculations'
import { useAsyncData } from './useAsyncData'

interface CentralBankData {
  populationByCohort: PopulationProjections
  headshipRates: HeadshipProjections
}

export interface CentralBankDataResult {
  loading: boolean
  error: Error | null
  populationByCohort: PopulationProjections | null
  headshipRates: HeadshipProjections | null
}

async function loadCentralBankData(): Promise<CentralBankData> {
  const [populationByCohort, headshipRates] = await Promise.all([
    dataLoaders.cbPopulation(),
    dataLoaders.cbHeadship()
  ])
  return { populationByCohort, headshipRates }
}

export function useCentralBankData(): CentralBankDataResult {
  const { loading, error, data } = useAsyncData(loadCentralBankData)

  return {
    loading,
    error,
    populationByCohort: data?.populationByCohort ?? null,
    headshipRates: data?.headshipRates ?? null
  }
}

import { useState, useEffect } from 'react'
import { dataLoaders } from '@/lib/dataLoader'
import type { PopulationProjections, HeadshipProjections } from '@/components/cohort-calculations'

export interface CentralBankDataResult {
  loading: boolean
  error: Error | null
  populationByCohort: PopulationProjections | null
  headshipRates: HeadshipProjections | null
}

export function useCentralBankData(): CentralBankDataResult {
  const [populationByCohort, setPopulationByCohort] = useState<PopulationProjections | null>(null)
  const [headshipRates, setHeadshipRates] = useState<HeadshipProjections | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [pop, head] = await Promise.all([
          dataLoaders.cbPopulation(),
          dataLoaders.cbHeadship()
        ])
        setPopulationByCohort(pop)
        setHeadshipRates(head)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load Central Bank data'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return { loading, error, populationByCohort, headshipRates }
}

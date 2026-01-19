import { useState, useEffect } from 'react'
import { dataLoaders, type ScenariosFile } from '@/lib/dataLoader'
import type { PopulationProjectionsFlexible } from '@/components/calculations'
import type { HeadshipProjections } from '@/data/headship-types'

export interface EsriDataResult {
  loading: boolean
  error: Error | null
  scenarios: ScenariosFile | null
  populationProjections: PopulationProjectionsFlexible | null
  headshipRates: HeadshipProjections | null
}

export function useEsriData(): EsriDataResult {
  const [scenarios, setScenarios] = useState<ScenariosFile | null>(null)
  const [populationProjections, setPopulationProjections] = useState<PopulationProjectionsFlexible | null>(null)
  const [headshipRates, setHeadshipRates] = useState<HeadshipProjections | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [scen, pop, head] = await Promise.all([
          dataLoaders.esriScenarios(),
          dataLoaders.esriPopulation(),
          dataLoaders.esriHeadship()
        ])
        setScenarios(scen)
        setPopulationProjections(pop as PopulationProjectionsFlexible)
        setHeadshipRates(head)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load ESRI data'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return { loading, error, scenarios, populationProjections, headshipRates }
}

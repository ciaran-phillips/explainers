import type { PopulationProjections } from '@/data/population-types'
import type { HeadshipProjections } from '@/data/headship-types'

export interface ScenariosFile {
  populationScenarios: Record<string, { label: string; description: string }>
  headshipScenarios: Record<string, { label: string; description: string }>
  obsolescenceScenarios: Record<string, { label: string; rate: number }>
  housingStock: Record<number, number>
}

async function loadJson<T>(filename: string): Promise<T> {
  const response = await fetch(`/data/${filename}`)
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}`)
  }
  return response.json()
}

export const dataLoaders = {
  esriPopulation: () => loadJson<PopulationProjections>('esri-population-projections.json'),
  esriHeadship: () => loadJson<HeadshipProjections>('esri-headship-rates.json'),
  esriScenarios: () => loadJson<ScenariosFile>('esri-scenarios.json'),
  cbPopulation: () => loadJson<PopulationProjections>('cb-population-by-cohort.json'),
  cbHeadship: () => loadJson<HeadshipProjections>('cb-headship-rates.json'),
}

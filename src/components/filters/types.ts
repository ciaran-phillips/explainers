export interface EsriFilterState {
  migration: string
  headship: string
  obsolescence: string
}

export interface CentralBankFilterState {
  migration: 'M1' | 'M2' | 'M3'
  headship: 'current' | 'gradual' | 'fast'
  obsolescence: number
}

export interface RadioOption<T = string> {
  value: T
  label: string
}

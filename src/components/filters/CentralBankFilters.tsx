import { RadioGroup } from './RadioGroup'
import type { CentralBankFilterState, RadioOption } from './types'

interface CentralBankFiltersProps {
  filters: CentralBankFilterState
  onMigrationChange: (value: 'M1' | 'M2' | 'M3') => void
  onHeadshipChange: (value: 'current' | 'gradual' | 'fast') => void
  onObsolescenceChange: (value: number) => void
}

const migrationOptions: RadioOption<'M1' | 'M2' | 'M3'>[] = [
  { value: 'M3', label: 'Low Migration' },
  { value: 'M2', label: 'Baseline Migration' },
  { value: 'M1', label: 'High Migration' }
]

const headshipOptions: RadioOption<'current' | 'gradual' | 'fast'>[] = [
  { value: 'current', label: 'Irish Current' },
  { value: 'gradual', label: 'Gradual convergence (until 2050)' },
  { value: 'fast', label: 'Fast convergence (until 2035)' }
]

const obsolescenceOptions: RadioOption<number>[] = [
  { value: 0, label: '0.00%' },
  { value: 0.0025, label: '0.25%' },
  { value: 0.005, label: '0.50%' }
]

export function CentralBankFilters({
  filters,
  onMigrationChange,
  onHeadshipChange,
  onObsolescenceChange
}: CentralBankFiltersProps) {
  return (
    <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>Scenario Selection</h3>

      <RadioGroup
        label="Migration Scenario"
        options={migrationOptions}
        value={filters.migration}
        onChange={onMigrationChange}
      />

      <div style={{ marginTop: '1.5rem' }}>
        <RadioGroup
          label="Household Formation"
          options={headshipOptions}
          value={filters.headship}
          onChange={onHeadshipChange}
        />
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <RadioGroup
          label="Obsolescence Rate"
          options={obsolescenceOptions}
          value={filters.obsolescence}
          onChange={onObsolescenceChange}
          formatLabel={opt => opt.label}
        />
      </div>
    </div>
  )
}

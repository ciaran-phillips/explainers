import type { RadioOption } from './types'

interface RadioGroupProps<T extends string | number> {
  label: string
  options: RadioOption<T>[]
  value: T
  onChange: (value: T) => void
  formatLabel?: (opt: RadioOption<T>) => string
}

export function RadioGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatLabel
}: RadioGroupProps<T>) {
  return (
    <div className="radio-group">
      <div className="radio-group-label">{label}</div>
      {options.map(opt => (
        <label key={String(opt.value)} className="radio-option">
          <input
            type="radio"
            name={label}
            value={String(opt.value)}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {formatLabel ? formatLabel(opt) : opt.label}
        </label>
      ))}
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { interpolateNumber } from 'd3-interpolate'

interface TimeSeriesPoint {
  year: number
  demand: number
}

function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2)
}

// Filter series to a year range for consistent array lengths
function filterToYearRange(
  series: TimeSeriesPoint[],
  startYear: number,
  endYear: number
): TimeSeriesPoint[] {
  return series.filter(d => d.year >= startYear && d.year <= endYear)
}

// Create interpolators for demand values only (years stay as integers)
function createDemandInterpolators(
  from: TimeSeriesPoint[],
  to: TimeSeriesPoint[]
): ((t: number) => number)[] {
  return to.map((toPoint, i) => {
    const fromDemand = from[i]?.demand ?? toPoint.demand
    return interpolateNumber(fromDemand, toPoint.demand)
  })
}

export function useAnimatedSeries(
  targetSeries: TimeSeriesPoint[],
  yearDomain: [number, number],
  duration: number = 300
): TimeSeriesPoint[] {
  // Filter target to year domain for consistent lengths
  const filteredTarget = filterToYearRange(targetSeries, yearDomain[0], yearDomain[1])

  const [displaySeries, setDisplaySeries] = useState<TimeSeriesPoint[]>(filteredTarget)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const interpolatorsRef = useRef<((t: number) => number)[]>([])

  const cancelAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  useEffect(() => {
    // Cancel any running animation
    cancelAnimation()

    // If no data, just set directly
    if (filteredTarget.length === 0) {
      setDisplaySeries(filteredTarget)
      return
    }

    // Start from current displayed position (handles interruptions smoothly)
    const fromSeries = displaySeries.length > 0 ? displaySeries : filteredTarget

    // Different lengths - just snap to new data
    if (fromSeries.length !== filteredTarget.length) {
      setDisplaySeries(filteredTarget)
      return
    }

    // Create interpolators for demand values only
    interpolatorsRef.current = createDemandInterpolators(fromSeries, filteredTarget)
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutSine(progress)

      // Interpolate demand values, keep years as integers from target
      const interpolated = filteredTarget.map((point, i) => ({
        year: point.year,
        demand: interpolatorsRef.current[i](eased)
      }))
      setDisplaySeries(interpolated)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return cancelAnimation
  }, [filteredTarget, duration, cancelAnimation])

  return displaySeries
}

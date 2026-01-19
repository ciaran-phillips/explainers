import { useState, useEffect } from 'react'

export interface AsyncDataResult<T> {
  loading: boolean
  error: Error | null
  data: T | null
}

export function useAsyncData<T>(loader: () => Promise<T>): AsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await loader()
        if (!cancelled) {
          setData(result)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to load data'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { loading, error, data }
}

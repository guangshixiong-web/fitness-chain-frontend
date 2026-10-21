'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api, errorMessage } from '../lib/api'

export function useApi<T>(url: string, initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(initialData === null)
  const [error, setError] = useState('')
  const useInitialResponse = useRef(initialData !== null)
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(url)
      setData(response.data.data as T)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [url])
  useEffect(() => {
    if (useInitialResponse.current) {
      useInitialResponse.current = false
      return
    }
    void reload()
  }, [reload])
  return { data, loading, error, reload, setData }
}

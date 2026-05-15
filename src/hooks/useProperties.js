import { useEffect, useState } from 'react'
import { normalizeProperties } from '../lib/properties'

export function useProperties() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const sources = [
      '/data/properties/land.json',
      '/data/properties/house.json',
      '/data/properties/apartment.json',
      '/data/properties/commercial.json',
    ]

    Promise.all(sources.map((src) => fetch(src).then((r) => (r.ok ? r.json() : []))))
      .then((parts) => {
        if (!active) return
        setData(normalizeProperties(parts.flat()))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { data, loading }
}

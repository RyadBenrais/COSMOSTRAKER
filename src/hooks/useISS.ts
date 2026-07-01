import { useState, useEffect } from 'react'

interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  timestamp: number
  region: string
}

interface ISSState {
  position: ISSPosition | null
  loading: boolean
  error: string | null
}

function useISS(): ISSState {
  const [state, setState] = useState<ISSState>({
    position: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        setState({
          position: {
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: data.altitude,
            velocity: data.velocity,
            region: getRegion(data.latitude, data.longitude),
            timestamp: data.timestamp,
          },
          loading: false,
          error: null,
        })
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Impossible de récupérer la position ISS',
        }))
      }
    }

    fetchISS()
    const interval = setInterval(fetchISS, 5000)

    return () => clearInterval(interval)
  }, [])

  const getRegion = (lat: number, lon: number): string => {
  if (lat > 35 && lat < 70 && lon > -10 && lon < 40) return '🇪🇺 Europe'
  if (lat > 25 && lat < 50 && lon > -125 && lon < -65) return '🇺🇸 États-Unis'
  if (lat > -35 && lat < 35 && lon > -20 && lon < 55) return '🌍 Afrique'
  if (lat > 10 && lat < 55 && lon > 55 && lon < 150) return '🌏 Asie'
  if (lat > -50 && lat < -10 && lon > -80 && lon < -35) return '🌎 Amérique du Sud'
  if (lat > -50 && lat < 10 && lon > 110 && lon < 180) return '🌏 Océanie'
  if (lat > 70 || lat < -60) return '🧊 Pôle'
  return '🌊 Océan'
}

  return state
}

export default useISS
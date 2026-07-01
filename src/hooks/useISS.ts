import { useState, useEffect } from 'react'

interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  timestamp: number
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

  return state
}

export default useISS
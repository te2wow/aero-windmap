'use client'

import { useEffect, useState, useRef } from 'react'
import { Airport } from '@/types/airport'
import airportsData from '@/data/airports.json'

interface MapComponentProps {
  selectedAirport: Airport | null
  onAirportSelect: (airport: Airport) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedAirport, onAirportSelect }) => {
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapId] = useState(() => `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const airports = airportsData as Airport[]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return

    let map: any = null

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        
        // Clean up previous instance if exists
        if (mapInstance) {
          try {
            mapInstance.remove()
          } catch (error) {
            console.warn('Error removing previous map instance:', error)
          }
          setMapInstance(null)
        }

        // Fix for default markers not showing in Next.js
        if (L.Icon.Default.prototype._getIconUrl) {
          delete (L.Icon.Default.prototype as any)._getIconUrl
        }
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Get map container
        const mapContainer = mapContainerRef.current
        if (!mapContainer) return

        // Clear any existing content
        mapContainer.innerHTML = ''

        // Create new map instance
        map = L.map(mapContainer, {
          center: [36.2048, 138.2529],
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        // Add airport markers
        airports.forEach((airport) => {
          const marker = L.marker([airport.latitude, airport.longitude])
            .addTo(map)
            .bindPopup(`
              <div class="p-2">
                <h3 class="font-bold">${airport.name}</h3>
                <p class="text-sm text-gray-600">${airport.nameEn}</p>
                <p class="text-sm">
                  <span class="font-semibold">IATA:</span> ${airport.iataCode} | 
                  <span class="font-semibold">ICAO:</span> ${airport.icaoCode}
                </p>
              </div>
            `)
            .on('click', () => {
              onAirportSelect(airport)
            })
        })

        setMapInstance(map)

      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    const timer = setTimeout(initMap, 100)
    
    return () => {
      clearTimeout(timer)
      if (map) {
        try {
          map.remove()
        } catch (error) {
          console.warn('Error cleaning up map on unmount:', error)
        }
      }
    }
  }, [isClient])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove()
        } catch (error) {
          console.warn('Error cleaning up map instance:', error)
        }
      }
    }
  }, [mapInstance])

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">地図を読み込み中...</span>
      </div>
    )
  }

  return (
    <div 
      ref={mapContainerRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '300px' }}
    />
  )
}

export default MapComponent
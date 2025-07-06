'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Airport, WeatherData, AmedasData } from '@/types/airport'
import airportsData from '@/data/airports.json'
import WindCompass from '@/components/WindCompass'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg"></div>
})

export default function Home() {
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const airports = airportsData as Airport[]

  const fetchWeatherData = async (airport: Airport) => {
    setLoading(true)
    setError(null)
    
    try {
      // Get latest time
      const latestTimeResponse = await fetch('/api/weather')
      
      if (!latestTimeResponse.ok) {
        throw new Error(`Failed to fetch latest time: ${latestTimeResponse.status}`)
      }
      
      const latestTimeData = await latestTimeResponse.json()
      
      if (latestTimeData.error) {
        throw new Error(latestTimeData.error)
      }
      
      const { latestTime } = latestTimeData
      
      if (!latestTime) {
        throw new Error('Latest time not available')
      }
      
      // Get weather data
      const weatherResponse = await fetch(`/api/weather/amedas/${latestTime}`)
      
      if (!weatherResponse.ok) {
        throw new Error(`Failed to fetch weather data: ${weatherResponse.status}`)
      }
      
      const weatherResponseData = await weatherResponse.json()
      
      if (weatherResponseData.error) {
        throw new Error(weatherResponseData.error)
      }
      
      const amedasData: AmedasData = weatherResponseData
      
      // Get weather data for the selected airport's station
      const stationData = amedasData[airport.amedasStation]
      setWeatherData(stationData || null)
      
      if (!stationData) {
        setError(`${airport.name}の観測データが利用できません`)
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '天気データの取得に失敗しました'
      setError(errorMessage)
      console.error('Error fetching weather data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport)
    fetchWeatherData(airport)
  }

  useEffect(() => {
    // Select Haneda airport by default
    const defaultAirport = airports.find(a => a.id === 'haneda')
    if (defaultAirport) {
      setSelectedAirport(defaultAirport)
      fetchWeatherData(defaultAirport)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">Kazelog</h1>
          <p className="text-sm md:text-base text-gray-600">空港の風向き・風速情報</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Map Section */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">日本の空港</h2>
            <div className="h-64 md:h-96 lg:h-[400px]">
              <MapComponent
                selectedAirport={selectedAirport}
                onAirportSelect={handleAirportSelect}
              />
            </div>
          </div>

          {/* Weather Info Section */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">気象情報</h2>
            
            {selectedAirport && (
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
                <h3 className="text-lg md:text-xl font-semibold mb-2">{selectedAirport.name}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-1">{selectedAirport.nameEn}</p>
                <p className="text-xs md:text-sm text-gray-500">
                  {selectedAirport.iataCode} / {selectedAirport.icaoCode}
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!loading && !error && (
              <WindCompass weatherData={weatherData} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

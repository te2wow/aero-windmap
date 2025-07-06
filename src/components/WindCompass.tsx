'use client'

import { memo } from 'react'
import { WeatherData } from '@/types/airport'

interface WindCompassProps {
  weatherData: WeatherData | null
  loading?: boolean
  className?: string
}

const WindCompass: React.FC<WindCompassProps> = memo(({ weatherData, loading = false, className = '' }) => {
  // AMeDAS wind data format: wind: [speed, quality], windDirection: [direction, quality]
  const windSpeed = weatherData?.wind?.[0]
  const windDirection = weatherData?.windDirection?.[0]

  const getDirectionText = (direction: number) => {
    const directions = ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西']
    return directions[Math.round(direction / 22.5) % 16]
  }

  const getArrowRotation = (direction: number) => {
    // Meteorological wind direction: where wind comes FROM
    // 0° = North wind (coming from north)
    // Arrow should point FROM the direction (showing wind source)
    // CSS rotation: 0° = pointing up, clockwise positive
    // So meteorological 0° (north) = CSS 0° (pointing up) + 180° = pointing down (from north)
    return direction - 180
  }

  const getSpeedColor = (speed: number) => {
    if (speed < 2) return '#22c55e' // Green for light wind
    if (speed < 5) return '#eab308' // Yellow for moderate wind
    if (speed < 8) return '#f97316' // Orange for strong wind
    return '#dc2626' // Red for very strong wind
  }

  const getWindStrengthData = (speed: number) => {
    if (speed < 2) return { 
      level: '微風', 
      emoji: '🍃', 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    }
    if (speed < 5) return { 
      level: '弱風', 
      emoji: '🌬️', 
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    }
    if (speed < 8) return { 
      level: '中風', 
      emoji: '💨', 
      bgColor: 'bg-orange-100', 
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    }
    return { 
      level: '強風', 
      emoji: '🌪️', 
      bgColor: 'bg-red-100', 
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        {/* Wind Information Header */}
        {windDirection !== undefined && windSpeed !== undefined && !loading ? (
          <div className="text-center">
            <div className="text-3xl font-light text-gray-900 mb-1 transition-all duration-300">
              {getDirectionText(windDirection)}
            </div>
            <div 
              className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium transition-all duration-300"
              style={{ backgroundColor: getSpeedColor(windSpeed) }}
            >
              {windSpeed} m/s
            </div>
          </div>
        ) : !loading ? (
          <div className="text-center text-gray-400">
            風データなし
          </div>
        ) : null}
        
        {/* Modern Compass */}
        <div className="relative w-32 h-32">
          {/* Compass Circle */}
          <div className="absolute inset-0 border border-gray-200 rounded-full bg-white"></div>
          
          {/* Cardinal Points */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">N</div>
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-600">E</div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">S</div>
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-600">W</div>
          
          {/* Cardinal Lines */}
          <div className="absolute top-0 left-1/2 w-px h-3 bg-gray-300 transform -translate-x-1/2"></div>
          <div className="absolute right-0 top-1/2 w-3 h-px bg-gray-300 transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-px h-3 bg-gray-300 transform -translate-x-1/2"></div>
          <div className="absolute left-0 top-1/2 w-3 h-px bg-gray-300 transform -translate-y-1/2"></div>
          
          {/* Wind Arrow */}
          {windDirection !== undefined && windSpeed !== undefined && !loading && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
              <g 
                transform={`translate(64,64) rotate(${windDirection})`}
                style={{ transition: 'transform 0.5s ease-in-out' }}
              >
                <line
                  x1="0"
                  y1="8"
                  x2="0"
                  y2="-50"
                  stroke={getSpeedColor(windSpeed)}
                  strokeWidth={Math.max(2, Math.min(6, windSpeed))}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.3s ease-in-out, stroke-width 0.3s ease-in-out' }}
                />
                <circle
                  cx="0"
                  cy="-50"
                  r={Math.max(3, Math.min(6, windSpeed * 0.8))}
                  fill={getSpeedColor(windSpeed)}
                  style={{ transition: 'fill 0.3s ease-in-out, r 0.3s ease-in-out' }}
                />
              </g>
            </svg>
          )}
          
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
        
        {/* Wind Strength Indicator */}
        {windDirection !== undefined && windSpeed !== undefined && !loading && (
          <div className="text-center">
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getWindStrengthData(windSpeed).bgColor} ${getWindStrengthData(windSpeed).textColor} ${getWindStrengthData(windSpeed).borderColor}`}
            >
              <span className="text-lg">{getWindStrengthData(windSpeed).emoji}</span>
              <span className="font-bold text-sm">{getWindStrengthData(windSpeed).level}</span>
              <span className="text-xs opacity-75">({windSpeed} m/s)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if wind data or loading state actually changed
  const prevWind = prevProps.weatherData?.wind?.[0]
  const prevDirection = prevProps.weatherData?.windDirection?.[0]
  const nextWind = nextProps.weatherData?.wind?.[0]
  const nextDirection = nextProps.weatherData?.windDirection?.[0]
  
  return prevWind === nextWind && 
         prevDirection === nextDirection && 
         prevProps.className === nextProps.className &&
         prevProps.loading === nextProps.loading
})

WindCompass.displayName = 'WindCompass'

export default WindCompass
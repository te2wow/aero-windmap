'use client'

import { WeatherData } from '@/types/airport'

interface WindCompassProps {
  weatherData: WeatherData | null
  className?: string
}

const WindCompass: React.FC<WindCompassProps> = ({ weatherData, className = '' }) => {
  // AMeDAS wind data format: [speed, quality, direction, directionQuality]
  const windSpeed = weatherData?.wind?.[0]
  const windDirection = weatherData?.wind?.[2]

  const getDirectionText = (direction: number) => {
    const directions = ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西']
    return directions[Math.round(direction / 22.5) % 16]
  }

  const getArrowRotation = (direction: number) => {
    // Convert meteorological direction to compass direction
    return direction + 180
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 md:p-6 ${className}`}>
      <h3 className="text-base md:text-lg font-semibold mb-4 text-center">風向・風速</h3>
      
      <div className="flex flex-col items-center">
        {/* Wind compass */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-2 border-gray-300 rounded-full mb-4">
          {/* Compass directions */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative">
              {/* N */}
              <div className="absolute top-1 sm:top-2 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm font-semibold text-gray-700">N</div>
              {/* E */}
              <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm font-semibold text-gray-700">E</div>
              {/* S */}
              <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm font-semibold text-gray-700">S</div>
              {/* W */}
              <div className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm font-semibold text-gray-700">W</div>
            </div>
          </div>
          
          {/* Wind arrow */}
          {windDirection !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-0.5 sm:w-1 h-8 sm:h-12 md:h-16 bg-red-500 origin-bottom transform transition-transform duration-300"
                style={{
                  transform: `rotate(${getArrowRotation(windDirection)}deg)`,
                }}
              >
                <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-red-500 transform rotate-45"></div>
              </div>
            </div>
          )}
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-600 rounded-full"></div>
          </div>
        </div>
        
        {/* Wind data */}
        <div className="text-center space-y-1 sm:space-y-2">
          {windDirection !== undefined && windSpeed !== undefined ? (
            <>
              <div className="text-lg sm:text-xl font-bold text-gray-800">
                {getDirectionText(windDirection)} {windDirection}°
              </div>
              <div className="text-base sm:text-lg text-gray-600">
                風速: {windSpeed} m/s
              </div>
            </>
          ) : (
            <div className="text-sm sm:text-base text-gray-500">
              風データがありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WindCompass
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

  const getAirportDisplayName = (airport: Airport) => {
    // Extract prefecture and airport name from the Japanese name
    const name = airport.name
    
    // Map of airport locations to prefectures
    const prefectureMap: { [key: string]: string } = {
      '新千歳': '北海道',
      '旭川': '北海道',
      '函館': '北海道',
      '釧路': '北海道',
      '帯広': '北海道',
      '女満別': '北海道',
      '稚内': '北海道',
      '紋別': '北海道',
      '中標津': '北海道',
      '利尻': '北海道',
      '奥尻': '北海道',
      '青森': '青森県',
      '三沢': '青森県',
      '秋田': '秋田県',
      '山形': '山形県',
      '庄内': '山形県',
      '仙台': '宮城県',
      '花巻': '岩手県',
      '福島': '福島県',
      '羽田': '東京都',
      '成田': '千葉県',
      '茨城': '茨城県',
      '調布': '東京都',
      '新潟': '新潟県',
      '富山': '富山県',
      '小松': '石川県',
      '能登': '石川県',
      '中部': '愛知県',
      '県営名古屋': '愛知県',
      '静岡': '静岡県',
      '松本': '長野県',
      '関西': '大阪府',
      '伊丹': '大阪府',
      '神戸': '兵庫県',
      '但馬': '兵庫県',
      '南紀白浜': '和歌山県',
      '鳥取': '鳥取県',
      '米子': '鳥取県',
      '出雲': '島根県',
      '石見': '島根県',
      '隠岐': '島根県',
      '岡山': '岡山県',
      '広島': '広島県',
      '岩国': '山口県',
      '山口宇部': '山口県',
      '高松': '香川県',
      '松山': '愛媛県',
      '高知': '高知県',
      '徳島': '徳島県',
      '北九州': '福岡県',
      '福岡': '福岡県',
      '佐賀': '佐賀県',
      '長崎': '長崎県',
      '対馬': '長崎県',
      '壱岐': '長崎県',
      '五島福江': '長崎県',
      '熊本': '熊本県',
      '天草': '熊本県',
      '大分': '大分県',
      '宮崎': '宮崎県',
      '鹿児島': '鹿児島県',
      '種子島': '鹿児島県',
      '屋久島': '鹿児島県',
      '奄美': '鹿児島県',
      '喜界島': '鹿児島県',
      '徳之島': '鹿児島県',
      '沖永良部': '鹿児島県',
      '与論': '鹿児島県',
      '那覇': '沖縄県',
      '石垣': '沖縄県',
      '宮古': '沖縄県',
      '久米島': '沖縄県',
      '慶良間': '沖縄県',
      '南大東': '沖縄県',
      '北大東': '沖縄県',
      '与那国': '沖縄県',
      '粟国': '沖縄県',
      '多良間': '沖縄県'
    }

    // Find matching prefecture
    for (const [airportKey, prefecture] of Object.entries(prefectureMap)) {
      if (name.includes(airportKey)) {
        const airportName = name.replace('空港', '')
        return { prefecture, airportName }
      }
    }
    
    // Fallback to just airport name
    return { prefecture: 'その他', airportName: name.replace('空港', '') }
  }

  const getAirportsByRegion = () => {
    const regions: { [key: string]: Airport[] } = {}
    
    airports.forEach(airport => {
      const { prefecture } = getAirportDisplayName(airport)
      
      // Group by region
      let region = 'その他'
      if (['北海道'].includes(prefecture)) region = '北海道'
      else if (['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'].includes(prefecture)) region = '東北'
      else if (['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'].includes(prefecture)) region = '関東'
      else if (['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'].includes(prefecture)) region = '中部'
      else if (['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'].includes(prefecture)) region = '関西'
      else if (['鳥取県', '島根県', '岡山県', '広島県', '山口県'].includes(prefecture)) region = '中国'
      else if (['徳島県', '香川県', '愛媛県', '高知県'].includes(prefecture)) region = '四国'
      else if (['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'].includes(prefecture)) region = '九州'
      else if (prefecture === '沖縄県') region = '沖縄'
      
      if (!regions[region]) regions[region] = []
      regions[region].push(airport)
    })
    
    return regions
  }

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
      console.log('Latest time API response:', latestTimeData)
      
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
      console.log('Weather API response:', weatherResponseData)
      
      if (weatherResponseData.error) {
        throw new Error(weatherResponseData.error)
      }
      
      const amedasData: AmedasData = weatherResponseData
      
      // Get weather data for the selected airport's station
      const stationData = amedasData[airport.amedasStation]
      console.log(`Station data for ${airport.name} (${airport.amedasStation}):`, stationData)
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
            
            {/* Airport Selection */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">空港選択</h3>
              <select 
                value={selectedAirport?.id || ''}
                onChange={(e) => {
                  const airport = airports.find(a => a.id === e.target.value)
                  if (airport) handleAirportSelect(airport)
                }}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">空港を選択してください</option>
                {Object.entries(getAirportsByRegion()).map(([region, airportsInRegion]) => (
                  <optgroup key={region} label={region}>
                    {airportsInRegion.map((airport) => {
                      const { prefecture, airportName } = getAirportDisplayName(airport)
                      return (
                        <option key={airport.id} value={airport.id}>
                          {prefecture} - {airportName} ({airport.iataCode})
                        </option>
                      )
                    })}
                  </optgroup>
                ))}
              </select>
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


            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!error && (
              <WindCompass weatherData={weatherData} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

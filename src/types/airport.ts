export interface Airport {
  id: string
  name: string
  nameEn: string
  iataCode: string
  icaoCode: string
  latitude: number
  longitude: number
  amedasStation: string
}

export interface WeatherData {
  temp?: [number, number]
  humidity?: [number, number]
  snow?: [number, number]
  wind?: [number, number]
  windDirection?: [number, number]
  precipitation10m?: [number, number]
  precipitation1h?: [number, number]
  precipitation3h?: [number, number]
  precipitation24h?: [number, number]
  sun10m?: [number, number]
  sun1h?: [number, number]
  visibility?: [number, number]
  pressure?: [number, number]
}

export interface AmedasData {
  [stationId: string]: WeatherData
}

export interface Station {
  type: string
  elems: string
  lat: [number, number]
  lon: [number, number]
  kjName: string
  knName?: string
  enName?: string
}
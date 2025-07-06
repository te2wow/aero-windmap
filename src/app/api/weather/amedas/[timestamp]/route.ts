import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ timestamp: string }> }
) {
  try {
    const { timestamp } = await params
    
    // Convert ISO timestamp to the format expected by JMA API
    // e.g., "2025-07-06T15:20:00+09:00" -> "20250706152000"
    const formattedTimestamp = timestamp.replace(/[T:+-]/g, '').slice(0, 12) + '00'
    
    const response = await fetch(`https://www.jma.go.jp/bosai/amedas/data/map/${formattedTimestamp}.json`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const text = await response.text()
    
    // Check if response is valid JSON
    if (!text.trim() || text.trim().length === 0) {
      throw new Error('Empty response from JMA API')
    }
    
    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response text:', text.substring(0, 200))
      throw new Error('Invalid JSON response from JMA API')
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching AMeDAS data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AMeDAS data', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
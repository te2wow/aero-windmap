import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://www.jma.go.jp/bosai/amedas/data/latest_time.txt')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const latestTime = await response.text()
    
    if (!latestTime.trim()) {
      throw new Error('Empty response from JMA API')
    }
    
    return NextResponse.json({ latestTime: latestTime.trim() })
  } catch (error) {
    console.error('Error fetching latest time:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest time', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
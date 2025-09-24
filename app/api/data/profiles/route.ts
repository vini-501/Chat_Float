import { NextRequest, NextResponse } from 'next/server'
import ArgoDatabase from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const minLat = searchParams.get('minLat') ? parseFloat(searchParams.get('minLat')!) : undefined
    const maxLat = searchParams.get('maxLat') ? parseFloat(searchParams.get('maxLat')!) : undefined
    const minLon = searchParams.get('minLon') ? parseFloat(searchParams.get('minLon')!) : undefined
    const maxLon = searchParams.get('maxLon') ? parseFloat(searchParams.get('maxLon')!) : undefined
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minTemp = searchParams.get('minTemp') ? parseFloat(searchParams.get('minTemp')!) : undefined
    const maxTemp = searchParams.get('maxTemp') ? parseFloat(searchParams.get('maxTemp')!) : undefined
    const minSal = searchParams.get('minSal') ? parseFloat(searchParams.get('minSal')!) : undefined
    const maxSal = searchParams.get('maxSal') ? parseFloat(searchParams.get('maxSal')!) : undefined

    console.log('API Request params:', {
      limit, offset, minLat, maxLat, minLon, maxLon, 
      startDate, endDate, minTemp, maxTemp, minSal, maxSal
    })

    let profiles = []

    // Determine query type based on parameters
    if (minLat !== undefined && maxLat !== undefined && minLon !== undefined && maxLon !== undefined) {
      // Geographic bounding box query
      profiles = await ArgoDatabase.getProfilesByBoundingBox(minLat, maxLat, minLon, maxLon, limit)
    } else if (startDate && endDate) {
      // Date range query
      profiles = await ArgoDatabase.getProfilesByDateRange(startDate, endDate, limit, offset)
    } else if (minTemp !== undefined || maxTemp !== undefined) {
      // Temperature query
      profiles = await ArgoDatabase.getProfilesByTemperature(minTemp, maxTemp, limit)
    } else if (minSal !== undefined || maxSal !== undefined) {
      // Salinity query
      profiles = await ArgoDatabase.getProfilesBySalinity(minSal, maxSal, limit)
    } else {
      // Default: recent profiles
      profiles = await ArgoDatabase.getRecentProfiles(limit, offset)
    }

    return NextResponse.json({
      success: true,
      data: profiles,
      metadata: {
        count: profiles.length,
        limit,
        offset,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching ARGO profiles:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch ARGO profiles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

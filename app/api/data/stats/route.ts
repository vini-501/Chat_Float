import { NextRequest, NextResponse } from 'next/server'
import ArgoDatabase from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const stats = await ArgoDatabase.getSummaryStats()

    return NextResponse.json({
      success: true,
      data: stats,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'supabase_postgres'
      }
    })

  } catch (error) {
    console.error('Error fetching ARGO statistics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch ARGO statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

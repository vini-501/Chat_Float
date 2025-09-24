import { NextRequest, NextResponse } from 'next/server'
import ArgoDatabase from '@/lib/database'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  actions?: Array<{
    type: string
    label: string
    data?: any
    icon?: any
  }>
}

interface ChatRequest {
  message: string
  conversationId?: string
  mode?: 'conversation' | 'explorer'
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, mode = 'conversation' }: ChatRequest = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Process query with real data
    const response = await processOceanographicQuery(message, mode)

    // Process response and add action buttons based on content
    const processedResponse = processLLMResponse(response, mode)

    return NextResponse.json({
      success: true,
      data: {
        id: generateId(),
        type: 'bot',
        content: processedResponse.content,
        timestamp: new Date(),
        actions: processedResponse.actions,
        conversationId: conversationId || generateId()
      }
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function processOceanographicQuery(message: string, mode: string): Promise<string> {
  try {
    console.log('🤖 Processing query:', message)
    
    // Handle specific queries with direct database calls
    const query = message.toLowerCase()
    
    // Check for total count queries
    if (query.includes('total') && (query.includes('profile') || query.includes('count') || query.includes('how many'))) {
      const stats = await ArgoDatabase.getSummaryStats()
      return generateTotalCountResponse(stats)
    }
    
    // Step 1: Convert natural language to database query
    const filters = analyzeQuery(message)
    console.log('🔍 Query filters:', filters)
    
    // Step 2: Execute appropriate database method
    const rawData = await executeFilteredQuery(filters)
    console.log('📊 Raw data retrieved:', rawData.length, 'records')
    
    // Step 3: Convert raw data to human-readable response
    const humanResponse = await convertToHumanResponse(message, rawData, '')
    
    return humanResponse
    
  } catch (error) {
    console.error('Error processing oceanographic query:', error)
    return generateFallbackResponse(message)
  }
}

function convertToSQL(naturalQuery: string): string {
  const query = naturalQuery.toLowerCase()
  
  // Base SQL query structure
  let sql = `SELECT 
    file, 
    date, 
    latitude, 
    longitude, 
    shallow_temp_mean, 
    shallow_psal_mean, 
    shallow_pres_mean,
    temp_mean,
    psal_mean,
    profile_temp_qc
  FROM argo_profiles`
  
  let conditions = []
  let orderBy = 'ORDER BY date DESC'
  let limit = 'LIMIT 50'
  
  // Geographic conditions
  if (query.includes('indian ocean')) {
    conditions.push('latitude BETWEEN -40 AND 30')
    conditions.push('longitude BETWEEN 20 AND 120')
  } else if (query.includes('arabian sea')) {
    conditions.push('latitude BETWEEN 10 AND 25')
    conditions.push('longitude BETWEEN 50 AND 80')
  } else if (query.includes('bay of bengal')) {
    conditions.push('latitude BETWEEN 5 AND 25') 
    conditions.push('longitude BETWEEN 80 AND 100')
  } else if (query.includes('equator')) {
    conditions.push('latitude BETWEEN -10 AND 10')
  } else if (query.includes('tropical')) {
    conditions.push('latitude BETWEEN -23.5 AND 23.5')
  }
  
  // Temperature conditions
  if (query.includes('warm') || query.includes('hot')) {
    conditions.push('shallow_temp_mean >= 25')
  } else if (query.includes('cold') || query.includes('cool')) {
    conditions.push('shallow_temp_mean <= 15')
  } else if (query.includes('temperature above')) {
    const tempMatch = query.match(/temperature above (\d+)/);
    if (tempMatch) {
      conditions.push(`shallow_temp_mean >= ${tempMatch[1]}`)
    }
  } else if (query.includes('temperature below')) {
    const tempMatch = query.match(/temperature below (\d+)/);
    if (tempMatch) {
      conditions.push(`shallow_temp_mean <= ${tempMatch[1]}`)
    }
  }
  
  // Salinity conditions
  if (query.includes('high salinity') || query.includes('salty')) {
    conditions.push('shallow_psal_mean >= 35')
  } else if (query.includes('low salinity') || query.includes('fresh')) {
    conditions.push('shallow_psal_mean <= 34')
  } else if (query.includes('salinity above')) {
    const salMatch = query.match(/salinity above ([\d.]+)/);
    if (salMatch) {
      conditions.push(`shallow_psal_mean >= ${salMatch[1]}`)
    }
  }
  
  // Quality conditions
  if (query.includes('good quality') || query.includes('high quality')) {
    conditions.push("profile_temp_qc IN ('A', '1')")
  }
  
  // Time conditions
  if (query.includes('2023')) {
    conditions.push("date >= '2023-01-01' AND date < '2024-01-01'")
  } else if (query.includes('2024')) {
    conditions.push("date >= '2024-01-01' AND date < '2025-01-01'")
  } else if (query.includes('march')) {
    conditions.push("EXTRACT(MONTH FROM date) = 3")
  } else if (query.includes('recent')) {
    conditions.push("date >= NOW() - INTERVAL '1 year'")
  }
  
  // Depth conditions
  if (query.includes('deep') || query.includes('depth')) {
    conditions.push('shallow_pres_mean > 100')
  } else if (query.includes('surface') || query.includes('shallow')) {
    conditions.push('shallow_pres_mean <= 50')
  }
  
  // Limit adjustments
  if (query.includes('all') || query.includes('every')) {
    limit = 'LIMIT 1000'
  } else if (query.includes('few') || query.includes('some')) {
    limit = 'LIMIT 10'
  } else if (query.includes('many')) {
    limit = 'LIMIT 100'
  }
  
  // Statistical queries
  if (query.includes('average') || query.includes('mean')) {
    sql = `SELECT 
      COUNT(*) as profile_count,
      AVG(shallow_temp_mean) as avg_temperature,
      AVG(shallow_psal_mean) as avg_salinity,
      AVG(shallow_pres_mean) as avg_pressure,
      MIN(shallow_temp_mean) as min_temperature,
      MAX(shallow_temp_mean) as max_temperature,
      MIN(shallow_psal_mean) as min_salinity,
      MAX(shallow_psal_mean) as max_salinity
    FROM argo_profiles`
    orderBy = ''
    limit = ''
  } else if (query.includes('count') || query.includes('how many')) {
    sql = `SELECT COUNT(*) as profile_count FROM argo_profiles`
    orderBy = ''
    limit = ''
  }
  
  // Build final query
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }
  
  if (orderBy) sql += ' ' + orderBy
  if (limit) sql += ' ' + limit
  
  return sql
}

async function executeFilteredQuery(filters: any): Promise<any[]> {
  try {
    console.log('🔍 Executing filtered query with:', filters)
    
    // Geographic filters
    if (filters.geographic && Object.keys(filters.geographic).length > 0) {
      const { minLat, maxLat, minLon, maxLon } = filters.geographic
      if (minLat !== undefined && maxLat !== undefined && minLon !== undefined && maxLon !== undefined) {
        return await ArgoDatabase.getProfilesByBoundingBox(minLat, maxLat, minLon, maxLon, 100)
      }
    }
    
    // Temperature filters
    if (filters.temperature && (filters.temperature.min !== undefined || filters.temperature.max !== undefined)) {
      return await ArgoDatabase.getProfilesByTemperature(filters.temperature.min, filters.temperature.max, 100)
    }
    
    // Salinity filters
    if (filters.salinity && (filters.salinity.min !== undefined || filters.salinity.max !== undefined)) {
      return await ArgoDatabase.getProfilesBySalinity(filters.salinity.min, filters.salinity.max, 100)
    }
    
    // Date filters
    if (filters.timeRange && filters.timeRange.recent) {
      return await ArgoDatabase.getRecentProfiles(100)
    }
    
    // Default: get recent profiles
    return await ArgoDatabase.getRecentProfiles(50)
    
  } catch (error) {
    console.error('Error executing filtered query:', error)
    // Fallback to recent profiles
    return await ArgoDatabase.getRecentProfiles(20)
  }
}

function generateTotalCountResponse(stats: any): string {
  const totalProfiles = stats.totalProfiles || 0
  
  let response = `🌊 **ARGO Database Overview**\n\n`
  response += `📊 **Total Oceanographic Profiles: ${totalProfiles.toLocaleString()}**\n\n`
  
  if (stats.dateRange) {
    response += `📅 **Data Coverage:**\n`
    response += `• **Earliest:** ${new Date(stats.dateRange.earliest).toLocaleDateString()}\n`
    response += `• **Latest:** ${new Date(stats.dateRange.latest).toLocaleDateString()}\n\n`
  }
  
  if (stats.temperatureRange) {
    response += `🌡️ **Temperature Range:**\n`
    response += `• **${stats.temperatureRange.min.toFixed(1)}°C** to **${stats.temperatureRange.max.toFixed(1)}°C**\n\n`
  }
  
  if (stats.salinityRange) {
    response += `🧂 **Salinity Range:**\n`
    response += `• **${stats.salinityRange.min.toFixed(2)} PSU** to **${stats.salinityRange.max.toFixed(2)} PSU**\n\n`
  }
  
  if (stats.geographicBounds) {
    response += `🗺️ **Global Coverage:**\n`
    response += `• **Latitude:** ${stats.geographicBounds.minLat.toFixed(1)}° to ${stats.geographicBounds.maxLat.toFixed(1)}°\n`
    response += `• **Longitude:** ${stats.geographicBounds.minLon.toFixed(1)}° to ${stats.geographicBounds.maxLon.toFixed(1)}°\n\n`
  }
  
  response += `💡 **What would you like to explore?**\n`
  response += `• "Show me warm water profiles"\n`
  response += `• "Analyze salinity in the Indian Ocean"\n`
  response += `• "Recent measurements from the Arabian Sea"\n`
  response += `• "Temperature trends near the equator"`
  
  return response
}

async function convertToHumanResponse(originalQuery: string, rawData: any[], sqlQuery: string): Promise<string> {
  if (!rawData || rawData.length === 0) {
    return `🌊 I searched the ARGO database for "${originalQuery}" but couldn't find any matching oceanographic profiles.

**Suggestions:**
• Try a different geographic region (e.g., "Indian Ocean", "Arabian Sea")
• Adjust temperature/salinity criteria
• Ask about recent data or specific time periods
• Use broader search terms

Would you like me to suggest some alternative queries or show you what data is available?`
  }
  
  // Check if this is a statistical query
  if (rawData[0]?.profile_count !== undefined) {
    return generateStatisticalResponse(originalQuery, rawData[0])
  }
  
  // Generate detailed analysis response
  return generateDetailedAnalysisResponse(originalQuery, rawData)
}

function generateStatisticalResponse(query: string, stats: any): string {
  let response = `🌊 **Ocean Data Analysis Results**\n\n`
  
  const profileCount = stats.profile_count || 0
  response += `📊 **Found ${profileCount.toLocaleString()} oceanographic profiles** matching your criteria\n\n`
  
  if (stats.avg_temperature) {
    response += `🌡️ **Temperature Analysis:**\n`
    response += `• Average: **${stats.avg_temperature.toFixed(1)}°C**\n`
    response += `• Range: ${stats.min_temperature?.toFixed(1)}°C to ${stats.max_temperature?.toFixed(1)}°C\n`
    
    if (stats.avg_temperature > 25) {
      response += `• *Warm tropical waters detected*\n`
    } else if (stats.avg_temperature < 15) {
      response += `• *Cool waters, possibly from higher latitudes*\n`
    }
    response += `\n`
  }
  
  if (stats.avg_salinity) {
    response += `🧂 **Salinity Analysis:**\n`
    response += `• Average: **${stats.avg_salinity.toFixed(2)} PSU**\n`
    response += `• Range: ${stats.min_salinity?.toFixed(2)} to ${stats.max_salinity?.toFixed(2)} PSU\n`
    
    if (stats.avg_salinity > 35) {
      response += `• *High salinity - evaporation-dominated region*\n`
    } else if (stats.avg_salinity < 34) {
      response += `• *Lower salinity - freshwater influence detected*\n`
    }
    response += `\n`
  }
  
  if (stats.avg_pressure) {
    response += `📏 **Depth Analysis:**\n`
    response += `• Average measurement depth: **${stats.avg_pressure.toFixed(0)} meters**\n\n`
  }
  
  response += `💡 **What would you like to explore next?**\n`
  response += `• View temperature/salinity charts\n`
  response += `• See geographic distribution on map\n`
  response += `• Export data for further analysis\n`
  response += `• Compare with other regions`
  
  return response
}

function generateDetailedAnalysisResponse(query: string, profiles: any[]): string {
  const profileCount = profiles.length
  let response = `🌊 **Ocean Data Analysis**\n\n`
  response += `📊 **Found ${profileCount} oceanographic profiles** for your query\n\n`
  
  // Temperature analysis
  const temps = profiles.map(p => p.shallow_temp_mean || p.temp_mean).filter(t => t != null)
  if (temps.length > 0) {
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const minTemp = Math.min(...temps)
    const maxTemp = Math.max(...temps)
    const tempVariation = maxTemp - minTemp
    
    response += `🌡️ **Temperature Insights:**\n`
    response += `• **Average:** ${avgTemp.toFixed(1)}°C\n`
    response += `• **Range:** ${minTemp.toFixed(1)}°C to ${maxTemp.toFixed(1)}°C\n`
    
    if (tempVariation > 10) {
      response += `• *High thermal diversity (${tempVariation.toFixed(1)}°C variation)*\n`
    } else {
      response += `• *Relatively uniform temperatures (${tempVariation.toFixed(1)}°C variation)*\n`
    }
    
    if (avgTemp > 25) {
      response += `• *Warm tropical/subtropical waters*\n`
    } else if (avgTemp < 15) {
      response += `• *Cool waters - higher latitude or upwelling zone*\n`
    }
    response += `\n`
  }
  
  // Salinity analysis
  const sals = profiles.map(p => p.shallow_psal_mean || p.psal_mean).filter(s => s != null)
  if (sals.length > 0) {
    const avgSal = sals.reduce((a, b) => a + b, 0) / sals.length
    const minSal = Math.min(...sals)
    const maxSal = Math.max(...sals)
    const salVariation = maxSal - minSal
    
    response += `🧂 **Salinity Patterns:**\n`
    response += `• **Average:** ${avgSal.toFixed(2)} PSU\n`
    response += `• **Range:** ${minSal.toFixed(2)} to ${maxSal.toFixed(2)} PSU\n`
    
    if (avgSal > 35) {
      response += `• *High salinity - evaporation exceeds precipitation*\n`
    } else if (avgSal < 34) {
      response += `• *Lower salinity - freshwater input or high precipitation*\n`
    } else {
      response += `• *Typical oceanic salinity levels*\n`
    }
    
    if (salVariation > 2) {
      response += `• *Significant salinity variation (${salVariation.toFixed(2)} PSU)*\n`
    }
    response += `\n`
  }
  
  // Geographic analysis
  const lats = profiles.map(p => p.latitude).filter(lat => lat != null)
  const lons = profiles.map(p => p.longitude).filter(lon => lon != null)
  if (lats.length > 0 && lons.length > 0) {
    const latRange = Math.max(...lats) - Math.min(...lats)
    const lonRange = Math.max(...lons) - Math.min(...lons)
    
    response += `🗺️ **Geographic Coverage:**\n`
    response += `• **Latitude:** ${Math.min(...lats).toFixed(2)}° to ${Math.max(...lats).toFixed(2)}°\n`
    response += `• **Longitude:** ${Math.min(...lons).toFixed(2)}° to ${Math.max(...lons).toFixed(2)}°\n`
    response += `• **Area:** ~${(latRange * lonRange * 111 * 111).toFixed(0)} km² coverage\n`
    response += `• **Locations:** ${lats.length} measurement points\n\n`
  }
  
  // Quality assessment
  const qcFlags = profiles.map(p => p.profile_temp_qc).filter(qc => qc != null)
  if (qcFlags.length > 0) {
    const goodQuality = qcFlags.filter(qc => qc === 'A' || qc === '1').length
    const qualityPercent = (goodQuality/qcFlags.length*100).toFixed(1)
    
    response += `✅ **Data Quality Assessment:**\n`
    response += `• **${goodQuality}/${qcFlags.length} profiles** passed quality control (${qualityPercent}%)\n`
    
    if (parseFloat(qualityPercent) > 80) {
      response += `• *Excellent data quality for reliable analysis*\n`
    } else if (parseFloat(qualityPercent) > 60) {
      response += `• *Good data quality with some flagged measurements*\n`
    } else {
      response += `• *Mixed quality - consider filtering for high-quality data only*\n`
    }
    response += `\n`
  }
  
  // Sample data and recent measurements
  if (profiles.length > 0) {
    const sample = profiles[0]
    response += `📋 **Latest Measurement:**\n`
    if (sample.date) {
      const measurementDate = new Date(sample.date)
      const daysAgo = Math.floor((Date.now() - measurementDate.getTime()) / (1000 * 60 * 60 * 24))
      response += `• **Date:** ${measurementDate.toLocaleDateString()} (${daysAgo} days ago)\n`
    }
    if (sample.latitude && sample.longitude) {
      response += `• **Location:** ${sample.latitude.toFixed(2)}°, ${sample.longitude.toFixed(2)}°\n`
    }
    if (sample.shallow_temp_mean) {
      response += `• **Temperature:** ${sample.shallow_temp_mean.toFixed(1)}°C\n`
    }
    if (sample.shallow_psal_mean) {
      response += `• **Salinity:** ${sample.shallow_psal_mean.toFixed(2)} PSU\n`
    }
    response += `\n`
  }
  
  response += `🎯 **Next Steps:**\n`
  response += `• 📊 View interactive charts and trends\n`
  response += `• 🗺️ Explore data on an interactive map\n`
  response += `• 📁 Export data for detailed analysis\n`
  response += `• 🔍 Refine search with additional filters\n\n`
  
  response += `*Ask me to show charts, maps, or help you explore specific aspects of this data!*`
  
  return response
}

function analyzeQuery(query: string) {
  const lowerQuery = query.toLowerCase()
  const filters: any = {
    geographic: {},
    temperature: {},
    salinity: {},
    timeRange: {}
  }
  
  // Geographic analysis with more precise boundaries
  if (lowerQuery.includes('indian ocean')) {
    filters.geographic = { minLat: -40, maxLat: 30, minLon: 20, maxLon: 120 }
  } else if (lowerQuery.includes('arabian sea')) {
    filters.geographic = { minLat: 10, maxLat: 25, minLon: 50, maxLon: 80 }
  } else if (lowerQuery.includes('bay of bengal')) {
    filters.geographic = { minLat: 5, maxLat: 25, minLon: 80, maxLon: 100 }
  } else if (lowerQuery.includes('equator')) {
    filters.geographic = { minLat: -10, maxLat: 10, minLon: -180, maxLon: 180 }
  } else if (lowerQuery.includes('tropical')) {
    filters.geographic = { minLat: -23.5, maxLat: 23.5, minLon: -180, maxLon: 180 }
  } else if (lowerQuery.includes('pacific')) {
    filters.geographic = { minLat: -60, maxLat: 60, minLon: 120, maxLon: -70 }
  } else if (lowerQuery.includes('atlantic')) {
    filters.geographic = { minLat: -60, maxLat: 70, minLon: -80, maxLon: 20 }
  }
  
  // Temperature analysis with specific thresholds
  if (lowerQuery.includes('warm') || lowerQuery.includes('hot')) {
    filters.temperature.min = 25
  } else if (lowerQuery.includes('cold') || lowerQuery.includes('cool')) {
    filters.temperature.max = 15
  } else if (lowerQuery.includes('temperature above')) {
    const tempMatch = lowerQuery.match(/temperature above (\d+)/)
    if (tempMatch) filters.temperature.min = parseFloat(tempMatch[1])
  } else if (lowerQuery.includes('temperature below')) {
    const tempMatch = lowerQuery.match(/temperature below (\d+)/)
    if (tempMatch) filters.temperature.max = parseFloat(tempMatch[1])
  }
  
  // Salinity analysis with specific thresholds
  if (lowerQuery.includes('high salinity') || lowerQuery.includes('salty')) {
    filters.salinity.min = 35
  } else if (lowerQuery.includes('low salinity') || lowerQuery.includes('fresh')) {
    filters.salinity.max = 34
  } else if (lowerQuery.includes('salinity above')) {
    const salMatch = lowerQuery.match(/salinity above ([\d.]+)/)
    if (salMatch) filters.salinity.min = parseFloat(salMatch[1])
  } else if (lowerQuery.includes('salinity below')) {
    const salMatch = lowerQuery.match(/salinity below ([\d.]+)/)
    if (salMatch) filters.salinity.max = parseFloat(salMatch[1])
  }
  
  // Time analysis
  if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
    filters.timeRange = { recent: true }
  } else if (lowerQuery.includes('2024')) {
    filters.timeRange = { year: 2024 }
  } else if (lowerQuery.includes('2023')) {
    filters.timeRange = { year: 2023 }
  }
  
  console.log('🔍 Analyzed query filters:', filters)
  return filters
}

function generateResponse(query: string, profiles: any[], stats: any, filters: any): string {
  if (!profiles || profiles.length === 0) {
    return `I couldn't find any ARGO profiles matching your criteria. Try adjusting your search parameters or asking about a different region.`
  }
  
  let response = `**ARGO Profile Analysis Results**\n\n`
  
  // Basic statistics
  response += `**Dataset Summary:**\n`
  response += `• Found **${profiles.length}** profiles matching your criteria\n`
  
  if (stats) {
    response += `• Total profiles in database: **${stats.totalProfiles?.toLocaleString() || 'N/A'}**\n`
  }
  
  // Temperature analysis
  const temps = profiles.map(p => p.shallow_temp_mean).filter(t => t != null)
  let avgTemp = 0, minTemp = 0, maxTemp = 0
  if (temps.length > 0) {
    avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    minTemp = Math.min(...temps)
    maxTemp = Math.max(...temps)
    
    response += `• **Temperature range:** ${minTemp.toFixed(1)}°C to ${maxTemp.toFixed(1)}°C\n`
    response += `• **Average temperature:** ${avgTemp.toFixed(1)}°C\n`
  }
  
  // Salinity analysis
  const sals = profiles.map(p => p.shallow_psal_mean).filter(s => s != null)
  let avgSal = 0, minSal = 0, maxSal = 0
  if (sals.length > 0) {
    avgSal = sals.reduce((a, b) => a + b, 0) / sals.length
    minSal = Math.min(...sals)
    maxSal = Math.max(...sals)
    
    response += `• **Salinity range:** ${minSal.toFixed(2)} to ${maxSal.toFixed(2)} PSU\n`
    response += `• **Average salinity:** ${avgSal.toFixed(2)} PSU\n`
  }
  
  // Geographic distribution
  const lats = profiles.map(p => p.latitude).filter(lat => lat != null)
  const lons = profiles.map(p => p.longitude).filter(lon => lon != null)
  if (lats.length > 0 && lons.length > 0) {
    response += `• **Geographic range:** ${Math.min(...lats).toFixed(1)}°N to ${Math.max(...lats).toFixed(1)}°N, ${Math.min(...lons).toFixed(1)}°E to ${Math.max(...lons).toFixed(1)}°E\n`
  }
  
  // Quality assessment
  const qcFlags = profiles.map(p => p.profile_temp_qc).filter(qc => qc != null)
  const goodQuality = qcFlags.filter(qc => qc === 'A' || qc === '1').length
  if (qcFlags.length > 0) {
    response += `• **Data quality:** ${goodQuality}/${qcFlags.length} profiles with good quality control\n`
  }
  
  response += `\n**Key Insights:**\n`
  
  // Query-specific insights
  if (query.includes('temperature') || query.includes('warm') || query.includes('cold')) {
    if (temps.length > 0) {
      const tempVariation = maxTemp - minTemp
      response += `• Temperature variation of ${tempVariation.toFixed(1)}°C indicates ${tempVariation > 10 ? 'high' : 'moderate'} thermal diversity\n`
      
      if (avgTemp > 25) {
        response += `• Warm surface waters detected, typical of tropical/subtropical regions\n`
      } else if (avgTemp < 15) {
        response += `• Cool surface waters detected, indicating higher latitude or upwelling areas\n`
      }
    }
  }
  
  if (query.includes('salinity')) {
    if (sals.length > 0) {
      if (avgSal > 35) {
        response += `• High salinity values suggest evaporation-dominated regions\n`
      } else if (avgSal < 34) {
        response += `• Lower salinity values may indicate freshwater input or precipitation\n`
      }
    }
  }
  
  if (query.includes('indian ocean')) {
    response += `• Indian Ocean profiles show typical monsoon-influenced patterns\n`
  } else if (query.includes('arabian sea')) {
    response += `• Arabian Sea data reflects seasonal upwelling and high evaporation\n`
  } else if (query.includes('bay of bengal')) {
    response += `• Bay of Bengal profiles show influence of river discharge and monsoons\n`
  }
  
  response += `\nWould you like me to show you specific data tables, temperature charts, or map visualizations for these profiles?`
  
  return response
}

function generateFallbackResponse(message: string): string {
  return `I can help you analyze ARGO oceanographic data! Here are some things you can ask me about:

**Temperature Analysis:**
• "Find warm water profiles in the Indian Ocean"
• "Show me cold water areas"
• "What's the average temperature in the Arabian Sea?"

**Salinity Patterns:**
• "Analyze salinity in the Bay of Bengal"
• "Find high salinity regions"
• "Compare salinity patterns across regions"

**Geographic Queries:**
• "Show profiles near [coordinates]"
• "Data from the Indian Ocean"
• "Arabian Sea measurements"

**Data Exploration:**
• "Recent ARGO profiles"
• "Quality control statistics"
• "Temperature and salinity trends"

Try asking me something specific about oceanographic data!`
}

function processLLMResponse(content: string, mode: string) {
  const actions = []

  // Add actions based on content analysis
  if (content.toLowerCase().includes('temperature') || content.toLowerCase().includes('thermal')) {
    actions.push({
      type: 'show_chart',
      label: 'Temperature Chart',
      data: { type: 'temperature_trends' }
    })
  }

  if (content.toLowerCase().includes('salinity')) {
    actions.push({
      type: 'show_chart',
      label: 'Salinity Profile',
      data: { type: 'salinity_profile' }
    })
  }

  if (content.toLowerCase().includes('location') || content.toLowerCase().includes('coordinates')) {
    actions.push({
      type: 'show_map',
      label: 'View on Map',
      data: { parameter: 'location' }
    })
  }

  if (content.toLowerCase().includes('data') || content.toLowerCase().includes('profile')) {
    actions.push({
      type: 'show_table',
      label: 'View Data Table',
      data: { type: 'profile_data' }
    })
  }

  // Explorer mode gets additional actions
  if (mode === 'explorer') {
    actions.push({
      type: 'export_data',
      label: 'Export Results',
      data: { format: 'csv' }
    })
  }

  return {
    content,
    actions: actions.slice(0, 4) // Limit to 4 actions
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

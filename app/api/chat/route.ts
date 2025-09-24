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
    
    // Step 1: Convert natural language to SQL query
    const sqlQuery = convertToSQL(message)
    console.log('🔍 Generated SQL:', sqlQuery)
    
    // Step 2: Execute SQL query against database
    const rawData = await executeSQL(sqlQuery)
    console.log('📊 Raw data retrieved:', rawData.length, 'records')
    
    // Step 3: Convert raw data to human-readable response
    const humanResponse = await convertToHumanResponse(message, rawData, sqlQuery)
    
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

async function executeSQL(sqlQuery: string): Promise<any[]> {
  try {
    // Use Supabase to execute raw SQL
    const { data, error } = await ArgoDatabase.supabase
      .rpc('execute_sql', { query: sqlQuery })
    
    if (error) {
      console.error('SQL execution error:', error)
      // Fallback to our existing methods for common queries
      return await executeFallbackQuery(sqlQuery)
    }
    
    return data || []
  } catch (error) {
    console.error('Error executing SQL:', error)
    // Fallback to our existing methods
    return await executeFallbackQuery(sqlQuery)
  }
}

async function executeFallbackQuery(sqlQuery: string): Promise<any[]> {
  // Parse the SQL to determine what method to use
  const sql = sqlQuery.toLowerCase()
  
  if (sql.includes('shallow_temp_mean >= 25')) {
    return await ArgoDatabase.getProfilesByTemperature(25, undefined, 50)
  } else if (sql.includes('shallow_temp_mean <= 15')) {
    return await ArgoDatabase.getProfilesByTemperature(undefined, 15, 50)
  } else if (sql.includes('latitude between') && sql.includes('longitude between')) {
    // Extract coordinates for bounding box
    const latMatch = sql.match(/latitude between (-?\d+) and (-?\d+)/)
    const lonMatch = sql.match(/longitude between (-?\d+) and (-?\d+)/)
    if (latMatch && lonMatch) {
      return await ArgoDatabase.getProfilesByBoundingBox(
        parseFloat(latMatch[1]), parseFloat(latMatch[2]),
        parseFloat(lonMatch[1]), parseFloat(lonMatch[2]),
        50
      )
    }
  }
  
  // Default fallback
  return await ArgoDatabase.getRecentProfiles(50)
}

async function convertToHumanResponse(originalQuery: string, rawData: any[], sqlQuery: string): Promise<string> {
  if (!rawData || rawData.length === 0) {
    return `I searched the ARGO database using the query "${originalQuery}" but couldn't find any matching profiles. 

**SQL Query Used:**
\`\`\`sql
${sqlQuery}
\`\`\`

Try adjusting your search criteria or asking about a different region or time period.`
  }
  
  // Check if this is a statistical query
  if (rawData[0]?.profile_count !== undefined) {
    return generateStatisticalResponse(originalQuery, rawData[0], sqlQuery)
  }
  
  // Generate detailed analysis response
  return generateDetailedAnalysisResponse(originalQuery, rawData, sqlQuery)
}

function generateStatisticalResponse(query: string, stats: any, sqlQuery: string): string {
  let response = `**ARGO Database Analysis Results**\n\n`
  response += `**Query:** "${query}"\n\n`
  
  response += `**Statistical Summary:**\n`
  response += `• **Total Profiles:** ${stats.profile_count?.toLocaleString() || 'N/A'}\n`
  
  if (stats.avg_temperature) {
    response += `• **Average Temperature:** ${stats.avg_temperature.toFixed(2)}°C\n`
    response += `• **Temperature Range:** ${stats.min_temperature?.toFixed(1)}°C to ${stats.max_temperature?.toFixed(1)}°C\n`
  }
  
  if (stats.avg_salinity) {
    response += `• **Average Salinity:** ${stats.avg_salinity.toFixed(2)} PSU\n`
    response += `• **Salinity Range:** ${stats.min_salinity?.toFixed(2)} to ${stats.max_salinity?.toFixed(2)} PSU\n`
  }
  
  if (stats.avg_pressure) {
    response += `• **Average Pressure:** ${stats.avg_pressure.toFixed(1)} dbar\n`
  }
  
  response += `\n**SQL Query Used:**\n`
  response += `\`\`\`sql\n${sqlQuery}\n\`\`\``
  
  return response
}

function generateDetailedAnalysisResponse(query: string, profiles: any[], sqlQuery: string): string {
  let response = `**ARGO Profile Analysis Results**\n\n`
  response += `**Query:** "${query}"\n`
  response += `**Profiles Found:** ${profiles.length}\n\n`
  
  // Temperature analysis
  const temps = profiles.map(p => p.shallow_temp_mean || p.temp_mean).filter(t => t != null)
  if (temps.length > 0) {
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const minTemp = Math.min(...temps)
    const maxTemp = Math.max(...temps)
    
    response += `**Temperature Analysis:**\n`
    response += `• Range: ${minTemp.toFixed(1)}°C to ${maxTemp.toFixed(1)}°C\n`
    response += `• Average: ${avgTemp.toFixed(1)}°C\n`
    response += `• Variation: ${(maxTemp - minTemp).toFixed(1)}°C\n\n`
  }
  
  // Salinity analysis
  const sals = profiles.map(p => p.shallow_psal_mean || p.psal_mean).filter(s => s != null)
  if (sals.length > 0) {
    const avgSal = sals.reduce((a, b) => a + b, 0) / sals.length
    const minSal = Math.min(...sals)
    const maxSal = Math.max(...sals)
    
    response += `**Salinity Analysis:**\n`
    response += `• Range: ${minSal.toFixed(2)} to ${maxSal.toFixed(2)} PSU\n`
    response += `• Average: ${avgSal.toFixed(2)} PSU\n`
    response += `• Variation: ${(maxSal - minSal).toFixed(2)} PSU\n\n`
  }
  
  // Geographic analysis
  const lats = profiles.map(p => p.latitude).filter(lat => lat != null)
  const lons = profiles.map(p => p.longitude).filter(lon => lon != null)
  if (lats.length > 0 && lons.length > 0) {
    response += `**Geographic Distribution:**\n`
    response += `• Latitude: ${Math.min(...lats).toFixed(2)}°N to ${Math.max(...lats).toFixed(2)}°N\n`
    response += `• Longitude: ${Math.min(...lons).toFixed(2)}°E to ${Math.max(...lons).toFixed(2)}°E\n`
    response += `• Coverage: ${lats.length} locations\n\n`
  }
  
  // Quality assessment
  const qcFlags = profiles.map(p => p.profile_temp_qc).filter(qc => qc != null)
  if (qcFlags.length > 0) {
    const goodQuality = qcFlags.filter(qc => qc === 'A' || qc === '1').length
    response += `**Data Quality:**\n`
    response += `• Good Quality: ${goodQuality}/${qcFlags.length} profiles (${(goodQuality/qcFlags.length*100).toFixed(1)}%)\n\n`
  }
  
  // Sample data
  if (profiles.length > 0) {
    response += `**Sample Profile:**\n`
    const sample = profiles[0]
    if (sample.date) response += `• Date: ${new Date(sample.date).toLocaleDateString()}\n`
    if (sample.latitude && sample.longitude) response += `• Location: ${sample.latitude.toFixed(2)}°N, ${sample.longitude.toFixed(2)}°E\n`
    if (sample.shallow_temp_mean) response += `• Temperature: ${sample.shallow_temp_mean.toFixed(1)}°C\n`
    if (sample.shallow_psal_mean) response += `• Salinity: ${sample.shallow_psal_mean.toFixed(2)} PSU\n`
  }
  
  response += `\n**SQL Query Used:**\n`
  response += `\`\`\`sql\n${sqlQuery}\n\`\`\``
  
  response += `\n\nWould you like me to show you charts, maps, or export this data?`
  
  return response
}

function analyzeQuery(query: string) {
  const filters: any = {
    geographic: {},
    temperature: {},
    salinity: {},
    timeRange: {}
  }
  
  // Geographic analysis
  if (query.includes('indian ocean')) {
    filters.geographic = { minLat: -40, maxLat: 30, minLon: 20, maxLon: 120 }
  } else if (query.includes('arabian sea')) {
    filters.geographic = { minLat: 10, maxLat: 25, minLon: 50, maxLon: 80 }
  } else if (query.includes('bay of bengal')) {
    filters.geographic = { minLat: 5, maxLat: 25, minLon: 80, maxLon: 100 }
  } else if (query.includes('equator')) {
    filters.geographic = { minLat: -10, maxLat: 10, minLon: 20, maxLon: 120 }
  }
  
  // Temperature analysis
  if (query.includes('warm') || query.includes('hot') || query.includes('high temperature')) {
    filters.temperature.min = 25
  } else if (query.includes('cold') || query.includes('cool') || query.includes('low temperature')) {
    filters.temperature.max = 15
  } else if (query.includes('temperature')) {
    // General temperature query - no specific filter but indicates temperature focus
    filters.temperature.general = true
  }
  
  // Salinity analysis
  if (query.includes('high salinity') || query.includes('salty')) {
    filters.salinity.min = 35
  } else if (query.includes('low salinity') || query.includes('fresh')) {
    filters.salinity.max = 34
  } else if (query.includes('salinity')) {
    // General salinity query - no specific filter but indicates salinity focus
    filters.salinity.general = true
  }
  
  // Time analysis
  if (query.includes('2023')) {
    filters.timeRange = { year: 2023 }
  } else if (query.includes('march')) {
    filters.timeRange = { month: 'march' }
  } else if (query.includes('recent')) {
    filters.timeRange = { recent: true }
  }
  
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

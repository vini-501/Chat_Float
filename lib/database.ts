import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ARGO Profile interface based on your actual database schema
export interface ArgoProfile {
  file: string
  juld: number
  date: string  // This maps to "DATE" column
  latitude: number  // This maps to LATITUDE column
  longitude: number  // This maps to LONGITUDE column
  cycle_number: number  // This maps to CYCLE_NUMBER column
  direction: string  // This maps to "DIRECTION" column
  profile_temp_qc: string  // This maps to PROFILE_TEMP_QC column
  profile_psal_qc: string  // This maps to PROFILE_PSAL_QC column
  profile_pres_qc: string  // This maps to PROFILE_PRES_QC column
  pres_min: number  // This maps to PRES_min column
  pres_max: number  // This maps to PRES_max column
  pres_mean: number  // This maps to PRES_mean column
  pres_adjusted_min: number  // This maps to PRES_ADJUSTED_min column
  pres_adjusted_max: number  // This maps to PRES_ADJUSTED_max column
  pres_adjusted_mean: number  // This maps to PRES_ADJUSTED_mean column
  temp_min: number  // This maps to TEMP_min column
  temp_max: number  // This maps to TEMP_max column
  temp_mean: number  // This maps to TEMP_mean column
  temp_adjusted_min: number  // This maps to TEMP_ADJUSTED_min column
  temp_adjusted_max: number  // This maps to TEMP_ADJUSTED_max column
  temp_adjusted_mean: number  // This maps to TEMP_ADJUSTED_mean column
  psal_min: number  // This maps to PSAL_min column
  psal_max: number  // This maps to PSAL_max column
  psal_mean: number  // This maps to PSAL_mean column
  psal_adjusted_min: number  // This maps to PSAL_ADJUSTED_min column
  psal_adjusted_max: number  // This maps to PSAL_ADJUSTED_max column
  psal_adjusted_mean: number  // This maps to PSAL_ADJUSTED_mean column
  sigma_mean: number  // This maps to SIGMA_mean column
  strat: number  // This maps to STRAT column
  hab_score: number  // This maps to HAB_SCORE column
  shallow_temp_mean: number  // This maps to shallow_TEMP_mean column
  shallow_psal_mean: number  // This maps to shallow_PSAL_mean column
  shallow_pres_mean: number  // This maps to shallow_PRES_mean column
  shallow_sigma_mean: number  // This maps to shallow_SIGMA_mean column
  mid_temp_mean: number  // This maps to mid_TEMP_mean column
  mid_psal_mean: number  // This maps to mid_PSAL_mean column
  mid_pres_mean: number  // This maps to mid_PRES_mean column
  mid_sigma_mean: number  // This maps to mid_SIGMA_mean column
}

// Database query functions
export class ArgoDatabase {
  
  // Export supabase client for direct SQL access
  static get supabase() {
    return supabase
  }
  
  // Get recent ARGO profiles with pagination
  static async getRecentProfiles(limit: number = 100, offset: number = 0): Promise<ArgoProfile[]> {
    try {
      const { data, error } = await supabase
        .from('argo_profiles')
        .select('file, juld, date, latitude, longitude, cycle_number, direction, profile_temp_qc, profile_psal_qc, shallow_temp_mean, shallow_psal_mean')
        .order('date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent profiles:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching recent profiles:', error)
      throw error
    }
  }

  // Get profiles by location (within radius in km)
  static async getProfilesByLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 100,
    limit: number = 100
  ): Promise<ArgoProfile[]> {
    // Using PostGIS functions for geographic queries
    const { data, error } = await supabase
      .rpc('get_profiles_within_radius', {
        center_lat: latitude,
        center_lon: longitude,
        radius_km: radiusKm,
        profile_limit: limit
      })

    if (error) {
      console.error('Error fetching profiles by location:', error)
      // Fallback to simple bounding box query
      return this.getProfilesByBoundingBox(
        latitude - radiusKm/111, 
        latitude + radiusKm/111,
        longitude - radiusKm/111, 
        longitude + radiusKm/111,
        limit
      )
    }

    return data || []
  }

  // Get profiles by bounding box (fallback method)
  static async getProfilesByBoundingBox(
    minLat: number,
    maxLat: number, 
    minLon: number,
    maxLon: number,
    limit: number = 100
  ): Promise<ArgoProfile[]> {
    try {
      const { data, error } = await supabase
        .from('argo_profiles')
        .select('file, juld, date, latitude, longitude, shallow_temp_mean, shallow_psal_mean, profile_temp_qc')
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLon)
        .lte('longitude', maxLon)
        .limit(limit)

      if (error) {
        console.error('Error fetching profiles by bounding box:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching profiles by bounding box:', error)
      throw error
    }
  }

  // Get profiles by date range
  static async getProfilesByDateRange(
    startDate: string, 
    endDate: string, 
    limit: number = 100,
    offset: number = 0
  ): Promise<ArgoProfile[]> {
    try {
      const { data, error } = await supabase
        .from('argo_profiles')
        .select('*')
        .gte('"DATE"', startDate)
        .lte('"DATE"', endDate)
        .order('"DATE"', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching profiles by date range:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching profiles by date range:', error)
      throw error
    }
  }

  // Get profiles with specific temperature criteria (using shallow_temp_mean for surface)
  static async getProfilesByTemperature(
    minTemp?: number,
    maxTemp?: number,
    limit: number = 100
  ): Promise<ArgoProfile[]> {
    let query = supabase
      .from('argo_profiles')
      .select('file, juld, date, latitude, longitude, shallow_temp_mean, shallow_psal_mean, profile_temp_qc')
      .limit(limit)

    if (minTemp !== undefined) {
      query = query.gte('shallow_temp_mean', minTemp)
    }
    
    if (maxTemp !== undefined) {
      query = query.lte('shallow_temp_mean', maxTemp)
    }

    try {
      const { data, error } = await query

      if (error) {
        console.error('Error fetching profiles by temperature:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching profiles by temperature:', error)
      throw error
    }
  }

  // Get profiles with specific salinity criteria (using shallow_psal_mean for surface)
  static async getProfilesBySalinity(
    minSalinity?: number,
    maxSalinity?: number,
    limit: number = 100
  ): Promise<ArgoProfile[]> {
    let query = supabase
      .from('argo_profiles')
      .select('*')

    if (minSalinity !== undefined) {
      query = query.gte('shallow_psal_mean', minSalinity)
    }
    if (maxSalinity !== undefined) {
      query = query.lte('shallow_psal_mean', maxSalinity)
    }

    const { data, error } = await query
      .order('shallow_psal_mean', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching profiles by salinity:', error)
      throw error
    }

    return data || []
  }

  // Get summary statistics
  static async getSummaryStats(): Promise<{
    totalProfiles: number
    dateRange: { earliest: string; latest: string }
    temperatureRange: { min: number; max: number }
    salinityRange: { min: number; max: number }
    geographicBounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }
    qualityStats: { tempQC: string[]; psalQC: string[]; presQC: string[] }
  }> {
    try {
      // Use individual queries since we don't have the RPC function yet
      const [countResult, tempResult, salResult, geoResult, dateResult, qcResult] = await Promise.all([
        supabase.from('argo_profiles').select('file', { count: 'exact', head: true }),
        supabase.from('argo_profiles').select('shallow_temp_mean').not('shallow_temp_mean', 'is', null).order('shallow_temp_mean'),
        supabase.from('argo_profiles').select('shallow_psal_mean').not('shallow_psal_mean', 'is', null).order('shallow_psal_mean'),
        supabase.from('argo_profiles').select('latitude, longitude').not('latitude', 'is', null).not('longitude', 'is', null),
        supabase.from('argo_profiles').select('DATE').not('DATE', 'is', null).order('DATE'),
        supabase.from('argo_profiles').select('profile_temp_qc, profile_psal_qc, profile_pres_qc').limit(1000)
      ])

      const tempData = tempResult.data?.filter(t => t.shallow_temp_mean !== null) || []
      const salData = salResult.data?.filter(s => s.shallow_psal_mean !== null) || []
      const geoData = geoResult.data?.filter(g => g.latitude !== null && g.longitude !== null) || []
      const dateData = dateResult.data?.filter(d => d.DATE !== null) || []

      return {
        totalProfiles: countResult.count || 0,
        dateRange: { 
          earliest: dateData[0]?.DATE || '',
          latest: dateData[dateData.length - 1]?.DATE || ''
        },
        temperatureRange: {
          min: tempData[0]?.shallow_temp_mean || 0,
          max: tempData[tempData.length - 1]?.shallow_temp_mean || 0
        },
        salinityRange: {
          min: salData[0]?.shallow_psal_mean || 0,
          max: salData[salData.length - 1]?.shallow_psal_mean || 0
        },
        geographicBounds: {
          minLat: Math.min(...geoData.map(p => p.latitude)),
          maxLat: Math.max(...geoData.map(p => p.latitude)),
          minLon: Math.min(...geoData.map(p => p.longitude)),
          maxLon: Math.max(...geoData.map(p => p.longitude))
        },
        qualityStats: {
          tempQC: [...new Set(qcResult.data?.map(q => q.profile_temp_qc).filter(Boolean) || [])],
          psalQC: [...new Set(qcResult.data?.map(q => q.profile_psal_qc).filter(Boolean) || [])],
          presQC: [...new Set(qcResult.data?.map(q => q.profile_pres_qc).filter(Boolean) || [])]
        }
      }
    } catch (error) {
      console.error('Error fetching summary stats:', error)
      throw error
    }
  }

  // Execute custom SQL query (for advanced use cases)
  static async executeQuery(sql: string, params?: any[]): Promise<any[]> {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      parameters: params || []
    })

    if (error) {
      console.error('Error executing custom query:', error)
      throw error
    }

    return data || []
  }
}

// Export for use in API routes and components
export default ArgoDatabase

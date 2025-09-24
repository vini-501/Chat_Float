export interface ARGOProfile {
  file: string // PRIMARY KEY
  juld: number
  DATE: string // TIMESTAMPTZ
  latitude: number
  longitude: number
  cycle_number: number
  DIRECTION: string
  profile_temp_qc: string
  profile_psal_qc: string
  profile_pres_qc: string
  pres_min: number
  pres_max: number
  pres_mean: number
  pres_adjusted_min: number
  pres_adjusted_max: number
  pres_adjusted_mean: number
  temp_min: number
  temp_max: number
  temp_mean: number
  temp_adjusted_min: number
  temp_adjusted_max: number
  temp_adjusted_mean: number
  psal_min: number
  psal_max: number
  psal_mean: number
  psal_adjusted_min: number
  psal_adjusted_max: number
  psal_adjusted_mean: number
  sigma_mean: number
  strat: number
  hab_score: number
  shallow_temp_mean: number
  shallow_psal_mean: number
  shallow_pres_mean: number
  shallow_sigma_mean: number
  mid_temp_mean: number
  mid_psal_mean: number
  mid_pres_mean: number
  mid_sigma_mean: number
  // Computed fields for display
  location_name?: string
  ocean_basin?: string
  thermal_structure?: string
}

export interface ARGOQueryResult {
  data: ARGOProfile[]
  metadata: {
    total_count: number
    page: number
    page_size: number
    has_next: boolean
    query_time: string
    source: string
  }
}

export interface VectorSearchResult {
  profiles: ARGOProfile[]
  similarities: number[]
  metadata: {
    query: string
    total_results: number
    search_time: string
    source: string
  }
}

export interface MCPToolResponse {
  success: boolean
  data?: any
  error?: string
  metadata: {
    timestamp: string
    source: string
    execution_time: number
  }
}

export interface IndianOceanAnalysis {
  monsoon_classification: string
  thermal_structure: string
  water_mass_type: string
  heat_content_category: string
  stratification_level: string
}

export interface EnhancedARGOProfile extends ARGOProfile {
  analysis: IndianOceanAnalysis
  search_tags: string[]
  rag_context: string
}

/**
 * ML Model utilities and interfaces for oceanographic analysis
 */

export interface OceanProfile {
  latitude: number;
  longitude: number;
  pressure: number;
  temperature: number;
  salinity: number;
  [key: string]: number | string;
}

export interface QualityControlResult {
  isGood: boolean;
  confidence: number;
}

export interface RegionIdentificationResult {
  regionId: number;
  regionName: string;
  confidence: number;
}

export interface SalinityPrediction {
  predictedSalinity: number;
  confidence: number;
}

export const OCEAN_REGIONS = {
  0: 'Central Indian Ocean',
  1: 'Red Sea/Arabian Sea Outflow', 
  2: 'Southern Ocean',
  3: 'Equatorial Surface Waters'
} as const;

export type OceanRegionId = keyof typeof OCEAN_REGIONS;

/**
 * Model file paths relative to the models directory
 */
export const MODEL_PATHS = {
  QC_CLASSIFIER: '/models/oceanographic/qc_classifier_model.joblib',
  OCEAN_CLUSTER: '/models/oceanographic/ocean_cluster_model.joblib',
  SALINITY_REGRESSOR: '/models/oceanographic/salinity_regressor_model.joblib',
  FEATURE_MEANS: '/models/oceanographic/feature_means.joblib',
  SCALER: '/models/oceanographic/scaler.joblib'
} as const;

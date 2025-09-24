import { useState, useCallback } from 'react';
import { 
  QualityControlResult, 
  RegionIdentificationResult, 
  SalinityPrediction,
  OceanProfile 
} from '@/lib/ml-models';

interface UseMLInsightsReturn {
  loading: boolean;
  error: string | null;
  predictQuality: (profile: OceanProfile) => Promise<QualityControlResult | null>;
  identifyRegion: (profile: OceanProfile) => Promise<RegionIdentificationResult | null>;
  predictSalinity: (profile: Partial<OceanProfile>) => Promise<SalinityPrediction | null>;
}

export function useMLInsights(): UseMLInsightsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callMLAPI = useCallback(async (modelType: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ml-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelType,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('ML API call failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const predictQuality = useCallback(async (profile: OceanProfile): Promise<QualityControlResult | null> => {
    return await callMLAPI('quality_control', profile);
  }, [callMLAPI]);

  const identifyRegion = useCallback(async (profile: OceanProfile): Promise<RegionIdentificationResult | null> => {
    return await callMLAPI('region_identification', profile);
  }, [callMLAPI]);

  const predictSalinity = useCallback(async (profile: Partial<OceanProfile>): Promise<SalinityPrediction | null> => {
    return await callMLAPI('salinity_prediction', profile);
  }, [callMLAPI]);

  return {
    loading,
    error,
    predictQuality,
    identifyRegion,
    predictSalinity,
  };
}

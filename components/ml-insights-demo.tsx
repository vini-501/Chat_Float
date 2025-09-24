import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMLInsights } from "@/hooks/use-ml-insights";
import { OCEAN_REGIONS } from "@/lib/ml-models";
import { 
  Brain, 
  MapPin, 
  Droplets, 
  CheckCircle, 
  XCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  Globe
} from "lucide-react";

interface MLTestData {
  latitude: number;
  longitude: number;
  temperature: number;
  salinity: number;
  pressure: number;
}

export default function MLInsightsDemo() {
  const { loading, error, predictQuality, identifyRegion, predictSalinity } = useMLInsights();
  
  const [testData, setTestData] = useState<MLTestData>({
    latitude: -20.5,
    longitude: 65.2,
    temperature: 15.3,
    salinity: 35.1,
    pressure: 1000
  });

  const [results, setResults] = useState<{
    quality?: any;
    region?: any;
    salinity?: any;
  }>({});

  const handleInputChange = (field: keyof MLTestData, value: string) => {
    setTestData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const runQualityControl = async () => {
    const result = await predictQuality(testData);
    setResults(prev => ({ ...prev, quality: result }));
  };

  const runRegionIdentification = async () => {
    const result = await identifyRegion(testData);
    setResults(prev => ({ ...prev, region: result }));
  };

  const runSalinityPrediction = async () => {
    const result = await predictSalinity(testData);
    setResults(prev => ({ ...prev, salinity: result }));
  };

  const runAllModels = async () => {
    const [quality, region, salinity] = await Promise.all([
      predictQuality(testData),
      identifyRegion(testData),
      predictSalinity(testData)
    ]);
    
    setResults({ quality, region, salinity });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Machine Learning Models
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            AI-Powered Ocean Analytics
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience our state-of-the-art ML models trained on Argo float data. 
            Test quality control, region identification, and salinity forecasting capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Test Ocean Profile Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.1"
                    value={testData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.1"
                    value={testData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={testData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="salinity">Salinity (PSU)</Label>
                  <Input
                    id="salinity"
                    type="number"
                    step="0.1"
                    value={testData.salinity}
                    onChange={(e) => handleInputChange('salinity', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pressure">Pressure (dbar)</Label>
                  <Input
                    id="pressure"
                    type="number"
                    step="10"
                    value={testData.pressure}
                    onChange={(e) => handleInputChange('pressure', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                <Button 
                  onClick={runQualityControl} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Quality Control
                </Button>
                <Button 
                  onClick={runRegionIdentification} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Identify Region
                </Button>
                <Button 
                  onClick={runSalinityPrediction} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Predict Salinity
                </Button>
                <Button 
                  onClick={runAllModels} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Run All Models
                </Button>
              </div>

              {error && (
                <div className="text-red-600 text-sm mt-2">
                  Error: {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Quality Control Result */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.quality?.isGood ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : results.quality?.isGood === false ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Brain className="h-5 w-5 text-gray-400" />
                  )}
                  Data Quality Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.quality ? (
                  <div>
                    <Badge variant={results.quality.isGood ? "default" : "destructive"}>
                      {results.quality.isGood ? "Good Quality" : "Poor Quality"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Confidence: {(results.quality.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Run quality control to see results</p>
                )}
              </CardContent>
            </Card>

            {/* Region Identification Result */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Ocean Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.region ? (
                  <div>
                    <Badge variant="secondary">
                      Region {results.region.regionId}
                    </Badge>
                    <p className="font-medium mt-2">{results.region.regionName}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(results.region.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Run region identification to see results</p>
                )}
              </CardContent>
            </Card>

            {/* Salinity Prediction Result */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-cyan-600" />
                  Salinity Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.salinity ? (
                  <div>
                    <p className="text-2xl font-bold text-cyan-600">
                      {results.salinity.predictedSalinity.toFixed(2)} PSU
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Model R²: {(results.salinity.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Run salinity prediction to see results</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Model Performance Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Quality Control</CardTitle>
              <div className="text-2xl font-bold text-green-600">99.7%</div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">F1-Score for automated data quality assessment</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Region Clustering</CardTitle>
              <div className="text-2xl font-bold text-blue-600">4 Regions</div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Optimal oceanographic region identification</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-50 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle>Salinity Forecasting</CardTitle>
              <div className="text-2xl font-bold text-cyan-600">98.5%</div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">R² accuracy for salinity prediction models</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

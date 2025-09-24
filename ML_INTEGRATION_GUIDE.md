# ML Model Integration Setup Guide

## Overview
This guide explains how to integrate your trained oceanographic ML models with the Next.js application for use in the insights section.

## Directory Structure Created

```
/workspaces/Chat_Float/
├── models/
│   ├── oceanographic/          # Place your .joblib model files here
│   │   ├── qc_classifier_model.joblib
│   │   ├── ocean_cluster_model.joblib
│   │   ├── salinity_regressor_model.joblib
│   │   ├── feature_means.joblib
│   │   └── scaler.joblib
│   └── README.md
├── lib/
│   └── ml-models.ts           # TypeScript interfaces and constants
├── hooks/
│   └── use-ml-insights.ts     # React hook for ML API calls
├── app/api/
│   └── ml-insights/
│       └── route.ts           # API endpoint for ML inference
├── components/
│   └── ml-insights-demo.tsx   # Interactive ML demo component
└── scripts/
    └── ml_inference.py        # Python script for model inference
```

## Setup Steps

### 1. Copy Your Model Files
Copy these trained model files from your ML environment to `/workspaces/Chat_Float/models/oceanographic/`:

- `qc_classifier_model.joblib` (Quality Control Classifier - 99.7% F1-score)
- `ocean_cluster_model.joblib` (Ocean Region Identifier - 4 clusters)  
- `salinity_regressor_model.joblib` (Salinity Forecaster - 98.5% R²)
- `feature_means.joblib` (Feature means for missing value imputation)
- `scaler.joblib` (StandardScaler for feature normalization)

### 2. Install Python Dependencies
The ML inference script requires these Python packages:

```bash
cd /workspaces/Chat_Float/scripts
pip install joblib pandas numpy scikit-learn
```

Or add to your existing `requirements.txt`:
```
joblib>=1.3.0
pandas>=1.5.0
numpy>=1.24.0
scikit-learn>=1.3.0
```

### 3. Test the Setup

#### Test Python Script Directly
```bash
cd /workspaces/Chat_Float
python3 scripts/ml_inference.py quality_control '{"latitude": -20.5, "longitude": 65.2, "temperature": 15.3, "salinity": 35.1, "pressure": 1000}'
```

#### Test via Next.js API
Start your development server:
```bash
npm run dev
```

Navigate to the insights section of your application and use the interactive ML demo.

### 4. Integration Points

#### The insights page now includes:
- **Interactive ML Demo**: Test all three models with custom ocean profile data
- **Real-time Predictions**: Quality control, region identification, and salinity forecasting
- **Model Performance Stats**: Display of the 99.7% F1-score, 4-region clustering, and 98.5% R² accuracy
- **Error Handling**: Graceful handling of model loading and prediction errors

#### API Endpoints:
- `POST /api/ml-insights` - Main ML inference endpoint
  - Supports `quality_control`, `region_identification`, and `salinity_prediction` model types

#### React Components:
- `MLInsightsDemo` - Interactive demo replacing the generic insights section
- `useMLInsights` hook - Provides easy access to ML capabilities from any component

## Model Capabilities

Based on your report, the models can handle these prediction tasks:

### Environmental Predictions ✅
- Sea Temperature Forecasting
- Salinity Trends  
- Ocean Stratification & Density

### Biological & Ecological Predictions ✅
- Fish Population Density (Indirect)
- Coral Reef Health (Bleaching Risk)
- Plankton Growth Zones

### Climate & Large-Scale Predictions ✅
- ENSO / Monsoon Predictions
- Sea Level Rise Indicators
- Heat Content Forecasting

### Navigation & Operational Predictions ✅
- Safe Navigation Zones
- Marine Heatwave Detection
- Upwelling Zone Forecasts (Partial)

## Next Steps

1. **Copy your model files** to the `models/oceanographic/` directory
2. **Test the Python script** with sample data
3. **Start your Next.js app** and navigate to the insights section
4. **Customize the demo component** based on your specific use cases
5. **Extend the API** to support additional model types or batch predictions

## Troubleshooting

### Common Issues:

1. **"Model file not found"**: Ensure `.joblib` files are in the correct directory
2. **Python import errors**: Install required packages with pip
3. **API timeouts**: Large models may need timeout adjustments in the API route
4. **Feature mismatch**: Check that input data matches the expected feature format

### Debug Mode:
Enable verbose logging by checking the browser console and terminal output when making API calls.

## Performance Considerations

- Models are loaded on each Python script execution
- For production, consider caching loaded models in memory
- Large feature sets (43+ features) may require optimization for real-time use
- Consider implementing batch prediction endpoints for processing multiple profiles

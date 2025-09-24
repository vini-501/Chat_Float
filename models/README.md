# ML Models Directory

This directory contains the trained machine learning models for oceanographic data analysis.

## Structure

```
models/
├── oceanographic/           # Argo oceanographic ML models
│   ├── qc_classifier_model.joblib      # Data quality control classifier (99.7% F1-score)
│   ├── ocean_cluster_model.joblib      # Ocean region identifier (4-cluster solution)
│   ├── salinity_regressor_model.joblib # Salinity forecasting model (98.5% R²)
│   ├── feature_means.joblib            # Feature means for missing value imputation
│   └── 
└── README.md               # This file
```

## Model Details

### Quality Control Classifier (`qc_classifier_model.joblib`)
- **Purpose**: Automated data quality assessment
- **Input**: 43 feature columns representing ocean profile
- **Output**: Binary classification (Good/Not Good quality)
- **Performance**: 99.7% F1-score

### Ocean Region Identifier (`ocean_cluster_model.joblib`)
- **Purpose**: Identify oceanographic regions
- **Input**: 9 scaled features (LATITUDE, LONGITUDE, PRES_ADJUSTED_mean, etc.)
- **Output**: Region ID (0-3) representing:
  - 0: Central Indian Ocean
  - 1: Red Sea/Arabian Sea Outflow
  - 2: Southern Ocean
  - 3: Equatorial Surface Waters
- **Performance**: Optimal 4-cluster solution

### Salinity Forecaster (`salinity_regressor_model.joblib`)
- **Purpose**: Predict ocean salinity
- **Input**: Partial feature set (supports missing value imputation)
- **Output**: Predicted salinity in PSU
- **Performance**: 98.5% R²

## Usage in Next.js Application

These models are designed to be used via API routes that interface with Python scripts in the `/scripts` directory.

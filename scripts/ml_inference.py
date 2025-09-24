#!/usr/bin/env python3
"""
ML Inference Script for Oceanographic Models
This script loads the trained models and performs predictions.
"""

import sys
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

MODEL_DIR = project_root / 'models' / 'oceanographic'

def load_models():
    """Load all ML models and preprocessing objects"""
    models = {}
    
    model_files = {
        'qc_classifier': 'qc_classifier_model.joblib',
        'ocean_cluster': 'ocean_cluster_model.joblib',
        'salinity_regressor': 'salinity_regressor_model.joblib',
        'feature_means': 'feature_means.joblib',
        'scaler': 'scaler.joblib'
    }
    
    for model_name, filename in model_files.items():
        model_path = MODEL_DIR / filename
        if model_path.exists():
            models[model_name] = joblib.load(model_path)
        else:
            print(f"Warning: Model file {filename} not found", file=sys.stderr)
    
    return models

def quality_control_prediction(models, data):
    """Perform quality control prediction"""
    try:
        # Convert data to DataFrame with expected 43 features
        df = pd.DataFrame([data])
        
        # Ensure we have all required features - pad with means if necessary
        if 'feature_means' in models:
            feature_means = models['feature_means']
            for col in feature_means.index:
                if col not in df.columns:
                    df[col] = feature_means[col]
        
        # Make prediction
        if 'qc_classifier' in models:
            prediction = models['qc_classifier'].predict(df)[0]
            confidence = models['qc_classifier'].predict_proba(df)[0].max()
            
            return {
                'prediction': int(prediction),
                'isGood': bool(prediction == 1),
                'confidence': float(confidence)
            }
        else:
            return {'error': 'Quality control model not available'}
            
    except Exception as e:
        return {'error': f'Quality control prediction failed: {str(e)}'}

def region_identification(models, data):
    """Perform ocean region identification"""
    try:
        # Expected features for clustering
        required_features = [
            'LATITUDE', 'LONGITUDE', 'PRES_ADJUSTED_mean', 
            'TEMP_ADJUSTED_mean', 'PSAL_ADJUSTED_mean', 
            'SIGMA_mean', 'STRAT', 'HAB_SCORE', 'TEMP_RANGE'
        ]
        
        # Create DataFrame with required features
        df = pd.DataFrame([data])
        
        # Fill missing features with means
        if 'feature_means' in models:
            feature_means = models['feature_means']
            for col in required_features:
                if col not in df.columns and col in feature_means.index:
                    df[col] = feature_means[col]
        
        # Select and scale features
        feature_data = df[required_features].values
        
        if 'scaler' in models:
            scaled_data = models['scaler'].transform(feature_data)
        else:
            scaled_data = feature_data
        
        # Make prediction
        if 'ocean_cluster' in models:
            prediction = models['ocean_cluster'].predict(scaled_data)[0]
            
            region_names = {
                0: 'Central Indian Ocean',
                1: 'Red Sea/Arabian Sea Outflow',
                2: 'Southern Ocean', 
                3: 'Equatorial Surface Waters'
            }
            
            return {
                'regionId': int(prediction),
                'regionName': region_names.get(prediction, 'Unknown Region'),
                'confidence': 0.95  # Placeholder - actual confidence would need model modification
            }
        else:
            return {'error': 'Ocean cluster model not available'}
            
    except Exception as e:
        return {'error': f'Region identification failed: {str(e)}'}

def salinity_prediction(models, data):
    """Perform salinity forecasting"""
    try:
        # Convert data to DataFrame
        df = pd.DataFrame([data])
        
        # Fill missing features with means
        if 'feature_means' in models:
            feature_means = models['feature_means']
            for col in feature_means.index:
                if col not in df.columns:
                    df[col] = feature_means[col]
        
        # Make prediction
        if 'salinity_regressor' in models:
            prediction = models['salinity_regressor'].predict(df)[0]
            
            return {
                'predictedSalinity': float(prediction),
                'confidence': 0.985  # Based on reported R² score
            }
        else:
            return {'error': 'Salinity regressor model not available'}
            
    except Exception as e:
        return {'error': f'Salinity prediction failed: {str(e)}'}

def main():
    if len(sys.argv) != 3:
        print(json.dumps({'error': 'Usage: ml_inference.py <model_type> <data_json>'}))
        sys.exit(1)
    
    model_type = sys.argv[1]
    data_json = sys.argv[2]
    
    try:
        data = json.loads(data_json)
    except json.JSONDecodeError as e:
        print(json.dumps({'error': f'Invalid JSON data: {str(e)}'}))
        sys.exit(1)
    
    # Load models
    models = load_models()
    
    # Route to appropriate prediction function
    if model_type == 'quality_control':
        result = quality_control_prediction(models, data)
    elif model_type == 'region_identification':
        result = region_identification(models, data)
    elif model_type == 'salinity_prediction':
        result = salinity_prediction(models, data)
    else:
        result = {'error': f'Unknown model type: {model_type}'}
    
    print(json.dumps(result))

if __name__ == '__main__':
    main()

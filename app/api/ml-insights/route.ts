import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelType, data } = body;

    if (!modelType || !data) {
      return NextResponse.json(
        { error: 'Missing modelType or data in request body' },
        { status: 400 }
      );
    }

    // Call Python script to run ML inference
    const result = await runMLInference(modelType, data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in ML inference:', error);
    return NextResponse.json(
      { error: 'Internal server error during ML inference' },
      { status: 500 }
    );
  }
}

async function runMLInference(modelType: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'ml_inference.py');
    const pythonProcess = spawn('python3', [scriptPath, modelType, JSON.stringify(data)]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (parseError) {
        reject(new Error(`Failed to parse Python script output: ${output}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python script: ${error.message}`));
    });
  });
}

import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

interface MCPRequest {
  method: string
  params: {
    name: string
    arguments: Record<string, any>
  }
}

export async function POST(request: NextRequest) {
  try {
    const mcpRequest: MCPRequest = await request.json()

    if (!mcpRequest.method || !mcpRequest.params) {
      return NextResponse.json(
        { error: 'Invalid MCP request format' },
        { status: 400 }
      )
    }

    // Call MCP server
    const result = await callMCPServer(mcpRequest)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('MCP API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process MCP request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function callMCPServer(mcpRequest: MCPRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(process.cwd(), 'server', 'mcp', 'index.ts')
    
    // Spawn Node.js process for MCP server
    const mcpProcess = spawn('node', ['-r', 'ts-node/register', serverPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    })

    let output = ''
    let errorOutput = ''

    // Send MCP request to stdin
    mcpProcess.stdin.write(JSON.stringify(mcpRequest) + '\n')
    mcpProcess.stdin.end()

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse JSON response from MCP server
          const lines = output.trim().split('\n')
          const lastLine = lines[lines.length - 1]
          const result = JSON.parse(lastLine)
          resolve(result)
        } catch (parseError) {
          reject(new Error(`Failed to parse MCP response: ${parseError}`))
        }
      } else {
        reject(new Error(`MCP server failed with code ${code}: ${errorOutput}`))
      }
    })

    mcpProcess.on('error', (error) => {
      reject(new Error(`Failed to start MCP server: ${error.message}`))
    })

    // Set timeout
    setTimeout(() => {
      mcpProcess.kill()
      reject(new Error('MCP request timeout'))
    }, 30000)
  })
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'MCP Server API is running',
    timestamp: new Date().toISOString(),
    availableTools: [
      'queryARGO',
      'retrieveARGO', 
      'getARGOByLocation',
      'getARGOByDateRange'
    ]
  })
}

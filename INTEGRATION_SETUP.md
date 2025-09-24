# FloatChat MCP & LLM Integration Setup

## 🌊 Architecture Overview

Your FloatChat now has a complete AI integration with:

- **MCP Server** (TypeScript) - Handles ARGO oceanographic data queries
- **LLM Agent** (Python) - OpenAI GPT-4 integration with RAG pipeline  
- **Next.js API Routes** - Connects UI to backend services
- **Ocean-themed UI** - Glassmorphism chatbot with scientific features

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
npm run python:setup
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# MCP Server Configuration
MCP_SERVER_PORT=3001
NODE_ENV=development
```

### 3. Database Setup

Your ARGO database should have this schema:
```sql
CREATE TABLE argo_profiles (
  id SERIAL PRIMARY KEY,
  platform_number VARCHAR(20),
  cycle_number INTEGER,
  latitude FLOAT,
  longitude FLOAT,
  date TIMESTAMP,
  thermocline_depth FLOAT,
  salinity_min_depth FLOAT,
  salinity_max_depth FLOAT,
  mean_stratification FLOAT,
  surface_temp FLOAT,
  surface_sal FLOAT,
  quality_flag VARCHAR(10),
  data_mode VARCHAR(10)
);
```

### 4. Run the Application

```bash
# Development mode (runs both Next.js and MCP server)
npm run dev:full

# Or run separately:
npm run dev          # Next.js frontend
npm run mcp:dev      # MCP server only
```

## 🔧 API Endpoints

### Chat API
- **POST** `/api/chat` - Send messages to LLM agent
- **Body**: `{ message: string, mode: 'conversation' | 'explorer' }`

### MCP API  
- **POST** `/api/mcp` - Direct MCP server communication
- **GET** `/api/mcp` - Health check and available tools

## 🌊 Available MCP Tools

1. **queryARGO** - Execute SQL queries on ARGO data
2. **retrieveARGO** - Semantic vector search
3. **getARGOByLocation** - Location-based search
4. **getARGOByDateRange** - Date range filtering

## 🎯 Chat Modes

### Conversation Mode
- Natural language Q&A about ocean data
- Contextual responses with scientific explanations
- Action buttons for visualization

### Explorer Mode  
- Data-focused responses
- Enhanced export capabilities
- Advanced filtering options

## 🔍 Testing

```bash
# Test MCP server connection
npm run test:mcp

# Test chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me temperature trends in the Pacific Ocean"}'
```

## 🛠 Troubleshooting

### Python Script Issues
- Ensure Python 3.8+ is installed
- Check `scripts/requirements.txt` dependencies
- Verify OpenAI API key is valid

### MCP Server Issues  
- Check Supabase connection
- Verify database schema matches expected format
- Check server logs for TypeScript compilation errors

### API Connection Issues
- Ensure both frontend (3000) and MCP server (3001) are running
- Check CORS settings if running on different domains
- Verify environment variables are loaded correctly

## 📁 File Structure

```
FloatChat/
├── app/api/
│   ├── chat/route.ts          # LLM chat integration
│   └── mcp/route.ts           # MCP server proxy
├── server/mcp/
│   ├── index.ts               # MCP server entry point
│   ├── tools.ts               # ARGO data tools
│   └── database.ts            # Supabase integration
├── scripts/
│   ├── llm_agent.py           # OpenAI LLM agent
│   ├── mcp_client.py          # MCP client
│   └── requirements.txt       # Python dependencies
└── components/
    └── floatchat-chatbot-section.tsx  # Ocean UI
```

## 🌟 Features

- **Real-time Chat** with OpenAI GPT-4
- **Scientific Term Highlighting** (temperature, salinity, etc.)
- **Action Buttons** for charts, maps, and data export
- **Mode Switching** between conversation and explorer
- **Error Handling** with graceful fallbacks
- **Ocean Theme** with glassmorphism effects

Your FloatChat is now fully integrated with AI capabilities! 🚀🌊

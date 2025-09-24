import asyncio
import json
import logging
from typing import Dict, Any, Optional
import aiohttp
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class MCPClientConfig:
    """Configuration for MCP Client"""
    server_url: str = "http://localhost:3000"  # Next.js API endpoint
    timeout: int = 30
    max_retries: int = 3

class MCPClient:
    """Client for communicating with MCP Server"""
    
    def __init__(self, config: MCPClientConfig = None):
        self.config = config or MCPClientConfig()
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.config.timeout)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def query_profiles(self, **filters) -> Dict[str, Any]:
        """Query ARGO profiles using the API endpoint"""
        if not self.session:
            raise RuntimeError("MCPClient must be used as async context manager")
        
        # Build query parameters
        params = {}
        if 'limit' in filters:
            params['limit'] = filters['limit']
        if 'offset' in filters:
            params['offset'] = filters['offset']
        if 'minLat' in filters:
            params['minLat'] = filters['minLat']
        if 'maxLat' in filters:
            params['maxLat'] = filters['maxLat']
        if 'minLon' in filters:
            params['minLon'] = filters['minLon']
        if 'maxLon' in filters:
            params['maxLon'] = filters['maxLon']
        if 'startDate' in filters:
            params['startDate'] = filters['startDate']
        if 'endDate' in filters:
            params['endDate'] = filters['endDate']
        if 'minTemp' in filters:
            params['minTemp'] = filters['minTemp']
        if 'maxTemp' in filters:
            params['maxTemp'] = filters['maxTemp']
        if 'minSal' in filters:
            params['minSal'] = filters['minSal']
        if 'maxSal' in filters:
            params['maxSal'] = filters['maxSal']
        
        try:
            url = f"{self.config.server_url}/api/data/profiles"
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    raise Exception(f"API request failed: {response.status} - {error_text}")
        except Exception as e:
            logger.error(f"Error querying profiles: {e}")
            raise
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        if not self.session:
            raise RuntimeError("MCPClient must be used as async context manager")
        
        try:
            url = f"{self.config.server_url}/api/data/stats"
            async with self.session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    raise Exception(f"Stats request failed: {response.status} - {error_text}")
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            raise

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool with the given arguments"""
        if not self.session:
            raise RuntimeError("MCPClient must be used as async context manager")
        
        # Route to appropriate API endpoint based on tool name
        if tool_name == "queryARGO":
            return await self.query_profiles(**arguments)
        elif tool_name == "getStats":
            return await self.get_stats()
        
        # Fallback to MCP server if available
        payload = {
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }
        
        for attempt in range(self.config.max_retries):
            try:
                async with self.session.post(
                    f"{self.config.server_url}/mcp",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"MCP call failed with status {response.status}: {error_text}")
                        
                        if attempt == self.config.max_retries - 1:
                            raise Exception(f"MCP call failed: {error_text}")
                        
            except aiohttp.ClientError as e:
                logger.error(f"Network error on attempt {attempt + 1}: {e}")
                if attempt == self.config.max_retries - 1:
                    raise Exception(f"Network error: {e}")
                
                # Wait before retry
                await asyncio.sleep(2 ** attempt)
        
        raise Exception("Max retries exceeded")
    
    async def query_argo(self, sql: str, page: int = 1, page_size: int = 100) -> Dict[str, Any]:
        """Execute SQL query on ARGO data"""
        return await self.call_tool("queryARGO", {
            "sql": sql,
            "page": page,
            "pageSize": page_size
        })
    
    async def retrieve_argo(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Perform semantic search on ARGO data"""
        return await self.call_tool("retrieveARGO", {
            "query": query,
            "limit": limit
        })
    
    async def get_argo_by_location(self, latitude: float, longitude: float, radius: float = 100) -> Dict[str, Any]:
        """Get ARGO profiles by location"""
        return await self.call_tool("getARGOByLocation", {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius
        })
    
    async def get_argo_by_date_range(self, start_date: str, end_date: str, page: int = 1, page_size: int = 100) -> Dict[str, Any]:
        """Get ARGO profiles by date range"""
        return await self.call_tool("getARGOByDateRange", {
            "startDate": start_date,
            "endDate": end_date,
            "page": page,
            "pageSize": page_size
        })

# Integration with LLM Agent
class ProductionARGOLLMAgent(ARGOLLMAgent):
    """Production version of ARGO LLM Agent that uses real MCP Client"""
    
    def __init__(self, openai_api_key: str, mcp_config: MCPClientConfig = None, model: str = "gpt-4"):
        super().__init__(openai_api_key, model)
        self.mcp_config = mcp_config or MCPClientConfig()
    
    async def _simulate_mcp_call(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Replace simulation with actual MCP client calls"""
        async with MCPClient(self.mcp_config) as client:
            try:
                if tool_call.tool_name == "queryARGO":
                    result = await client.query_argo(**tool_call.arguments)
                elif tool_call.tool_name == "retrieveARGO":
                    result = await client.retrieve_argo(**tool_call.arguments)
                elif tool_call.tool_name == "getARGOByLocation":
                    result = await client.get_argo_by_location(**tool_call.arguments)
                elif tool_call.tool_name == "getARGOByDateRange":
                    result = await client.get_argo_by_date_range(**tool_call.arguments)
                else:
                    return MCPToolResponse(
                        call_id=tool_call.call_id,
                        success=False,
                        error=f"Unknown tool: {tool_call.tool_name}"
                    )
                
                return MCPToolResponse(
                    call_id=tool_call.call_id,
                    success=result.get("success", True),
                    data=result.get("data"),
                    error=result.get("error"),
                    metadata=result.get("metadata", {})
                )
                
            except Exception as e:
                logger.error(f"MCP call failed: {e}")
                return MCPToolResponse(
                    call_id=tool_call.call_id,
                    success=False,
                    error=str(e)
                )

# Example usage with real MCP client
async def production_example():
    """Example using production MCP client"""
    
    # Configure MCP client
    mcp_config = MCPClientConfig(
        server_url="http://localhost:3001",
        timeout=30,
        max_retries=3
    )
    
    # Initialize production agent
    agent = ProductionARGOLLMAgent(
        openai_api_key=OS.getenv("OPENROUTER_API_KEY"),
        mcp_config=mcp_config
    )
    
    # Process query
    response = await agent.process_query(
        "Find warm water ARGO profiles in the tropical Pacific Ocean from 2023"
    )
    
    print(response)

if __name__ == "__main__":
    # Run production example
    asyncio.run(production_example())

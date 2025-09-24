import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import openai
from dataclasses import dataclass
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MCPToolCall:
    """Represents a call to an MCP tool"""
    tool_name: str
    arguments: Dict[str, Any]
    call_id: str

@dataclass
class MCPToolResponse:
    """Response from an MCP tool"""
    call_id: str
    success: bool
    data: Any = None
    error: str = None
    metadata: Dict[str, Any] = None

class ARGOLLMAgent:
    """LLM Agent that uses MCP Server tools to answer ARGO oceanographic queries"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.client = openai.OpenAI(api_key=openai_api_key)
        self.model = model
        self.conversation_history = []
        
        self.system_prompt = """You are an expert oceanographic data analyst specializing in ARGO float data. 

ARGO DATABASE SCHEMA (argo_profiles table):
- file: Profile file identifier (PRIMARY KEY)
- juld: Julian day
- DATE: Profile timestamp (TIMESTAMPTZ)
- latitude, longitude: Geographic coordinates
- cycle_number: Float cycle number
- DIRECTION: Profile direction (A=ascending, D=descending)
- profile_temp_qc, profile_psal_qc, profile_pres_qc: Quality control flags
- pres_min, pres_max, pres_mean: Pressure statistics (dbar)
- pres_adjusted_min, pres_adjusted_max, pres_adjusted_mean: Adjusted pressure statistics
- temp_min, temp_max, temp_mean: Temperature statistics (°C)
- temp_adjusted_min, temp_adjusted_max, temp_adjusted_mean: Adjusted temperature statistics
- psal_min, psal_max, psal_mean: Salinity statistics (PSU)
- psal_adjusted_min, psal_adjusted_max, psal_adjusted_mean: Adjusted salinity statistics
- sigma_mean: Mean density (kg/m³)
- strat: Stratification index
- hab_score: Habitat score
- shallow_temp_mean, shallow_psal_mean, shallow_pres_mean, shallow_sigma_mean: Shallow layer statistics
- mid_temp_mean, mid_psal_mean, mid_pres_mean, mid_sigma_mean: Mid-depth layer statistics
- surfacetemp: Sea surface temperature (°C)
- surfacesal: Sea surface salinity (PSU)
- n_levels: Number of measurement levels
- direction: Profile direction (ascending/descending)

AVAILABLE TOOLS:
1. queryARGO - Execute SQL queries on argo_profiles table
   - Use for: Statistical analysis, filtering by specific criteria, aggregations
   - Parameters: sql (required), page (optional), pageSize (optional)
   - Example: "SELECT * FROM argo_profiles WHERE lat BETWEEN -10 AND 10 AND mld > 50"

2. retrieveARGO - Semantic vector search using natural language
   - Use for: Conceptual queries, finding similar oceanographic conditions
   - Parameters: query (required), limit (optional)
   - Example: "deep mixed layer profiles during monsoon season"

3. getARGOByLocation - Find profiles near geographic coordinates
   - Parameters: latitude (required), longitude (required), radius (optional)

4. getARGOByDateRange - Retrieve profiles within date range
   - Parameters: startDate (required), endDate (required), page (optional), pageSize (optional)

INDIAN OCEAN CONTEXT:
- Monsoon seasons: SW Monsoon (June-September), NE Monsoon (December-March)
- Key features: Equatorial currents, upwelling zones, warm pool regions
- Thermal structure: Strong thermoclines, variable mixed layer depths
- Salinity patterns: Bay of Bengal freshening, Arabian Sea high salinity
- Heat content: Significant seasonal and interannual variability

RESPONSE GUIDELINES:
- Always provide oceanographic context specific to the Indian Ocean
- Interpret mixed layer depth in relation to monsoon patterns
- Explain thermocline structure and its implications
- Relate salinity patterns to regional freshwater inputs
- Include heat content analysis for climate relevance
- Reference monsoon seasonality when relevant
- Use proper oceanographic units and terminology

When you need to use a tool, format your response as:
TOOL_CALL: {"tool": "toolName", "arguments": {...}, "call_id": "unique_id"}"""

    async def process_query(self, user_query: str) -> str:
        """Process a user query and return a comprehensive response"""
        try:
            # Import MCP client here to avoid circular imports
            from mcp_client import MCPClient, MCPClientConfig
            
            # Analyze query and fetch relevant data
            query_filters = self._analyze_query_for_filters(user_query)
            
            async with MCPClient() as client:
                # Get relevant data based on query
                if query_filters:
                    profiles_response = await client.query_profiles(**query_filters)
                    stats_response = await client.get_stats()
                    
                    if profiles_response.get('success') and stats_response.get('success'):
                        profiles = profiles_response['data']
                        stats = stats_response['data']
                        
                        # Generate response based on real data
                        response = self._generate_data_response(user_query, profiles, stats)
                        return response
                
                # Fallback to general response if no specific data found
                return self._generate_general_response(user_query)
                
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return self._generate_fallback_response(user_query)

    def _analyze_query_for_filters(self, query: str) -> Dict[str, Any]:
        """Analyze user query to extract database filters"""
        filters = {}
        query_lower = query.lower()
        
        # Geographic filters
        if 'indian ocean' in query_lower:
            filters.update({
                'minLat': -40, 'maxLat': 30,
                'minLon': 20, 'maxLon': 120
            })
        elif 'arabian sea' in query_lower:
            filters.update({
                'minLat': 10, 'maxLat': 25,
                'minLon': 50, 'maxLon': 80
            })
        elif 'bay of bengal' in query_lower:
            filters.update({
                'minLat': 5, 'maxLat': 25,
                'minLon': 80, 'maxLon': 100
            })
        
        # Temperature filters
        if 'warm' in query_lower:
            filters['minTemp'] = 28
        elif 'cold' in query_lower:
            filters['maxTemp'] = 15
        
        # Time filters
        if '2023' in query:
            filters.update({
                'startDate': '2023-01-01',
                'endDate': '2023-12-31'
            })
        elif '2024' in query:
            filters.update({
                'startDate': '2024-01-01',
                'endDate': '2024-12-31'
            })
        
        # Limit results for performance
        filters['limit'] = 50
        
        return filters

    def _generate_data_response(self, query: str, profiles: List[Dict], stats: Dict) -> str:
        """Generate response based on real data"""
        if not profiles:
            return "🌊 No ARGO profiles found matching your criteria. Try adjusting your search parameters."
        
        # Basic statistics
        profile_count = len(profiles)
        
        # Temperature analysis
        temps = [p.get('shallow_temp_mean') for p in profiles if p.get('shallow_temp_mean')]
        avg_temp = sum(temps) / len(temps) if temps else None
        
        # Salinity analysis  
        sals = [p.get('shallow_psal_mean') for p in profiles if p.get('shallow_psal_mean')]
        avg_sal = sum(sals) / len(sals) if sals else None
        
        # Geographic distribution
        lats = [p.get('latitude') for p in profiles if p.get('latitude')]
        lons = [p.get('longitude') for p in profiles if p.get('longitude')]
        
        response = f"🌊 **ARGO Profile Analysis**\n\n"
        response += f"**Dataset Summary:**\n"
        response += f"• **Profiles Found**: {profile_count:,}\n"
        
        if avg_temp:
            response += f"• **Average Surface Temperature**: {avg_temp:.2f}°C\n"
        if avg_sal:
            response += f"• **Average Surface Salinity**: {avg_sal:.2f} PSU\n"
        
        if lats and lons:
            response += f"• **Geographic Range**: {min(lats):.1f}°N to {max(lats):.1f}°N, {min(lons):.1f}°E to {max(lons):.1f}°E\n"
        
        # Date range
        dates = [p.get('DATE') for p in profiles if p.get('DATE')]
        if dates:
            response += f"• **Time Range**: {min(dates)} to {max(dates)}\n"
        
        # Quality assessment
        qc_flags = [p.get('profile_temp_qc') for p in profiles if p.get('profile_temp_qc')]
        good_quality = len([q for q in qc_flags if q == 'A'])
        if qc_flags:
            response += f"• **Data Quality**: {good_quality}/{len(qc_flags)} profiles with excellent QC\n"
        
        response += f"\n**Key Insights:**\n"
        
        # Query-specific insights
        if 'temperature' in query.lower():
            if temps:
                response += f"• Temperature ranges from {min(temps):.1f}°C to {max(temps):.1f}°C\n"
                response += f"• Standard deviation: {(sum((t - avg_temp)**2 for t in temps) / len(temps))**0.5:.2f}°C\n"
        
        if 'salinity' in query.lower():
            if sals:
                response += f"• Salinity ranges from {min(sals):.2f} to {max(sals):.2f} PSU\n"
                response += f"• Typical oceanic salinity patterns observed\n"
        
        return response

    def _generate_general_response(self, query: str) -> str:
        """Generate general response for queries without specific data"""
        return f"🌊 I can help you analyze ARGO oceanographic data. Try asking about:\n\n• Temperature patterns in specific regions\n• Salinity distributions\n• Data from particular time periods\n• Quality control statistics\n\nFor example: 'Show me warm water profiles in the Indian Ocean' or 'What's the temperature data from Bay of Bengal in 2023?'"

    def _generate_fallback_response(self, query: str) -> str:
        """Generate fallback response when errors occur"""
        return f"🌊 I'm experiencing some technical difficulties accessing the oceanographic database. Please try again in a moment, or rephrase your question about ARGO float data."

    async def _get_llm_response(self) -> str:
        """Get initial response from LLM"""
        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.conversation_history
        ]
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.1,
            max_tokens=1500
        )
        
        return response.choices[0].message.content

    def _contains_tool_calls(self, response: str) -> bool:
        """Check if response contains tool calls"""
        return "TOOL_CALL:" in response

    async def _execute_tool_calls(self, response: str) -> List[MCPToolResponse]:
        """Extract and execute tool calls from LLM response"""
        tool_calls = self._extract_tool_calls(response)
        results = []
        
        for tool_call in tool_calls:
            try:
                # Simulate MCP tool execution (in real implementation, this would call MCP server)
                result = await self._simulate_mcp_call(tool_call)
                results.append(result)
            except Exception as e:
                logger.error(f"Tool call failed: {e}")
                results.append(MCPToolResponse(
                    call_id=tool_call.call_id,
                    success=False,
                    error=str(e)
                ))
        
        return results

    def _extract_tool_calls(self, response: str) -> List[MCPToolCall]:
        """Extract tool calls from LLM response"""
        tool_calls = []
        
        # Find all TOOL_CALL patterns
        pattern = r'TOOL_CALL:\s*({[^}]+})'
        matches = re.findall(pattern, response)
        
        for i, match in enumerate(matches):
            try:
                call_data = json.loads(match)
                tool_calls.append(MCPToolCall(
                    tool_name=call_data["tool"],
                    arguments=call_data["arguments"],
                    call_id=call_data.get("call_id", f"call_{i}")
                ))
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse tool call: {e}")
        
        return tool_calls

    async def _simulate_mcp_call(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate MCP tool call (replace with actual MCP client in production)"""
        # This is a simulation - in production, this would call the actual MCP server
        
        if tool_call.tool_name == "queryARGO":
            return await self._simulate_query_argo(tool_call)
        elif tool_call.tool_name == "retrieveARGO":
            return await self._simulate_retrieve_argo(tool_call)
        elif tool_call.tool_name == "getARGOByLocation":
            return await self._simulate_location_search(tool_call)
        elif tool_call.tool_name == "getARGOByDateRange":
            return await self._simulate_date_range_search(tool_call)
        else:
            return MCPToolResponse(
                call_id=tool_call.call_id,
                success=False,
                error=f"Unknown tool: {tool_call.tool_name}"
            )

    async def _simulate_query_argo(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate SQL query execution with Indian Ocean ARGO data"""
        sample_data = [
            {
                "id": 1,
                "file": "D1901393_001.nc",
                "date": "2023-06-15T12:00:00Z",
                "lat": -5.2,
                "lon": 67.8,
                "mld": 45.5,
                "thermoclinedepth": 120.3,
                "salinitymindepth": 85.2,
                "salinitymaxdepth": 200.1,
                "meanstratification": 0.0045,
                "ohc_0_200m": 2.8e9,
                "surfacetemp": 28.5,
                "surfacesal": 35.2,
                "n_levels": 156,
                "direction": "ascending"
            },
            {
                "id": 2,
                "file": "D1901394_002.nc", 
                "date": "2023-07-20T12:00:00Z",
                "lat": -8.1,
                "lon": 72.3,
                "mld": 32.8,
                "thermoclinedepth": 95.7,
                "salinitymindepth": 75.4,
                "salinitymaxdepth": 180.6,
                "meanstratification": 0.0052,
                "ohc_0_200m": 3.1e9,
                "surfacetemp": 29.2,
                "surfacesal": 34.8,
                "n_levels": 142,
                "direction": "ascending"
            }
        ]
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data={
                "data": sample_data,
                "metadata": {
                    "total_count": len(sample_data),
                    "page": 1,
                    "page_size": 100,
                    "has_next": False,
                    "query_time": datetime.now().isoformat(),
                    "source": "supabase_postgres",
                    "region": "Indian Ocean"
                }
            },
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "supabase_postgres",
                "execution_time": 150,
                "region": "Indian Ocean"
            }
        )

    async def _simulate_retrieve_argo(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate vector search with Indian Ocean context"""
        sample_data = {
            "profiles": [
                {
                    "id": 3,
                    "file": "D1901395_003.nc",
                    "date": "2023-08-01T12:00:00Z",
                    "lat": -12.5,
                    "lon": 78.9,
                    "mld": 28.3,
                    "thermoclinedepth": 85.2,
                    "salinitymindepth": 65.1,
                    "salinitymaxdepth": 150.8,
                    "meanstratification": 0.0058,
                    "ohc_0_200m": 3.4e9,
                    "surfacetemp": 30.1,
                    "surfacesal": 34.5,
                    "n_levels": 138,
                    "direction": "ascending",
                    "summary": "SW Monsoon profile with shallow mixed layer, strong thermocline, typical Bay of Bengal characteristics with reduced surface salinity"
                }
            ],
            "similarities": [0.92],
            "metadata": {
                "query": tool_call.arguments.get("query", ""),
                "total_results": 1,
                "search_time": datetime.now().isoformat(),
                "source": "faiss_vector_search",
                "region": "Indian Ocean",
                "seasonal_context": "SW Monsoon period"
            }
        }
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data=sample_data,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "faiss_vector_search",
                "execution_time": 85,
                "region": "Indian Ocean"
            }
        )

    async def _simulate_location_search(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate location-based search"""
        args = tool_call.arguments
        sample_data = {
            "profiles": [
                {
                    "id": "argo_loc_001",
                    "platform_number": "1901396",
                    "latitude": args["latitude"] + 0.1,
                    "longitude": args["longitude"] - 0.1,
                    "date": "2023-03-01T12:00:00Z",
                    "surface_temp": 20.1,
                    "surface_sal": 36.5
                }
            ],
            "location": {
                "latitude": args["latitude"],
                "longitude": args["longitude"],
                "radius": args.get("radius", 100)
            },
            "count": 1
        }
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data=sample_data,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "supabase_postgres",
                "execution_time": 120
            }
        )

    async def _simulate_date_range_search(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate date range search"""
        args = tool_call.arguments
        sample_data = {
            "profiles": [
                {
                    "id": "argo_date_001",
                    "platform_number": "1901397",
                    "latitude": 25.5,
                    "longitude": -80.2,
                    "date": "2023-06-15T12:00:00Z",
                    "surface_temp": 28.5,
                    "surface_sal": 36.8
                }
            ],
            "dateRange": {
                "startDate": args["startDate"],
                "endDate": args["endDate"]
            },
            "count": 1
        }
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data=sample_data,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "supabase_postgres",
                "execution_time": 95
            }
        )

    async def _get_final_response(self, tool_results: List[MCPToolResponse]) -> str:
        """Generate final response using tool results"""
        # Prepare tool results for LLM
        results_summary = []
        for result in tool_results:
            if result.success:
                results_summary.append({
                    "call_id": result.call_id,
                    "success": True,
                    "data": result.data,
                    "metadata": result.metadata
                })
            else:
                results_summary.append({
                    "call_id": result.call_id,
                    "success": False,
                    "error": result.error
                })
        
        # Create final prompt with results
        final_prompt = f"""
Based on the tool execution results below, provide a comprehensive answer to the user's query.

TOOL RESULTS:
{json.dumps(results_summary, indent=2)}

Please:
1. Synthesize the data into a coherent response
2. Include relevant oceanographic context and interpretation
3. Highlight key findings and patterns
4. Mention data quality and reliability where relevant
5. Use appropriate scientific terminology
6. Format the response clearly with proper units

Provide a natural language response that directly answers the user's question.
"""
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.conversation_history,
            {"role": "user", "content": final_prompt}
        ]
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.1,
            max_tokens=2000
        )
        
        final_answer = response.choices[0].message.content
        
        # Add to conversation history
        self.conversation_history.append({
            "role": "assistant",
            "content": final_answer
        })
        
        return final_answer

# Example usage and testing
async def main():
    """Example usage of the ARGO LLM Agent"""
    
    # Initialize agent (you would use your actual OpenAI API key)
    agent = ARGOLLMAgent(openai_api_key="your-openai-api-key-here")
    
    # Example queries
    test_queries = [
        "Find ARGO profiles with warm surface temperatures in the Indian Ocean",
        "What are the salinity patterns near the Arabian Sea?",
        "Show me temperature data from the Bay of Bengal in 2023",
        "Find profiles with unusual thermocline characteristics"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print(f"{'='*60}")
        
        try:
            response = await agent.process_query(query)
            print(f"Response: {response}")
        except Exception as e:
            print(f"Error: {e}")
        
        print("\n" + "-"*60)

if __name__ == "__main__":
    asyncio.run(main())

// Test the new LLM-style chat system
const fetch = require('node-fetch');

async function testLLMChat() {
  console.log('🤖 Testing LLM-Style Chat System\n');

  const queries = [
    "How many ARGO profiles are in the database?",
    "What's the average temperature in warm water profiles?",
    "Find profiles with temperature above 28 degrees",
    "Show me salinity data from the Indian Ocean",
    "Count profiles in tropical regions",
    "Find recent high quality profiles"
  ];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`${i + 1}. Query: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          mode: 'analysis'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.data?.content || '';
        
        console.log('✅ Response received');
        console.log('─'.repeat(60));
        
        // Show first few lines of response
        const lines = content.split('\n').slice(0, 8);
        lines.forEach(line => console.log(line));
        
        // Check if SQL query is included
        if (content.includes('```sql')) {
          console.log('🔍 SQL Query detected in response');
        }
        
        console.log('─'.repeat(60));
        console.log('');
        
      } else {
        console.log('❌ API Error:', response.status);
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || 'Unknown error'}\n`);
      }
    } catch (err) {
      console.log('❌ Request failed:', err.message);
    }
  }

  console.log('🎯 LLM Chat testing completed!');
}

// Run the test
testLLMChat();

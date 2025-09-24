// Test the chat API with real queries
const fetch = require('node-fetch');

async function testChatQueries() {
  console.log('🤖 Testing FloatChat AI Responses\n');

  const queries = [
    "Find ARGO profiles with warm surface temperatures in the Indian Ocean",
    "What are the salinity patterns near the Arabian Sea?",
    "Show me temperature data from the Bay of Bengal in 2023",
    "Find profiles with high salinity",
    "What's the average temperature in recent profiles?"
  ];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`${i + 1}. Testing: "${query}"`);
    
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
        console.log('✅ Response received');
        console.log(`   Length: ${data.data?.content?.length || 0} characters`);
        console.log(`   Preview: ${data.data?.content?.substring(0, 100) || 'No content'}...`);
        console.log(`   Actions: ${data.data?.actions?.length || 0} available\n`);
      } else {
        console.log('❌ Chat API failed:', response.status);
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || 'Unknown error'}\n`);
      }
    } catch (err) {
      console.log('❌ Request failed:', err.message);
    }
  }

  console.log('🎉 Chat testing completed!');
}

// Run the test
testChatQueries();

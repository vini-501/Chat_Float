// Test a single LLM query to see the full response including SQL
const fetch = require('node-fetch');

async function testSingleLLM() {
  console.log('🤖 Testing Single LLM Query\n');

  const query = "What's the average temperature in warm water profiles?";
  console.log(`Query: "${query}"\n`);
  
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
      console.log('✅ Full LLM Response:');
      console.log('=' .repeat(80));
      console.log(data.data?.content || 'No content');
      console.log('=' .repeat(80));
      
    } else {
      console.log('❌ API Error:', response.status);
      const errorData = await response.json();
      console.log(`Error: ${errorData.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.log('❌ Request failed:', err.message);
  }
}

// Run the test
testSingleLLM();

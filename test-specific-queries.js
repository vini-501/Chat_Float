// Test specific queries to see if they're being processed differently
const fetch = require('node-fetch');

async function testSpecificQueries() {
  console.log('🔍 Testing Specific Query Processing\n');

  const queries = [
    {
      query: "Show me salinity profiles near the equator in March 2023",
      expected: "Should detect: equator (geographic) + salinity + March 2023"
    },
    {
      query: "Find warm water profiles",
      expected: "Should detect: warm (temperature filter)"
    },
    {
      query: "What's the temperature in the Indian Ocean?",
      expected: "Should detect: Indian Ocean (geographic) + temperature"
    },
    {
      query: "Show recent profiles",
      expected: "Should detect: recent (time filter)"
    },
    {
      query: "Find high salinity areas",
      expected: "Should detect: high salinity (salinity filter)"
    }
  ];

  for (let i = 0; i < queries.length; i++) {
    const { query, expected } = queries[i];
    console.log(`${i + 1}. Query: "${query}"`);
    console.log(`   Expected: ${expected}`);
    
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
        const isGeneric = content.includes('I can help you analyze ARGO oceanographic data!');
        const hasResults = content.includes('Found **');
        
        if (isGeneric) {
          console.log('   ❌ Result: Generic fallback response');
        } else if (hasResults) {
          console.log('   ✅ Result: Specific data analysis');
          // Extract profile count
          const match = content.match(/Found \*\*(\d+)\*\* profiles/);
          if (match) {
            console.log(`   📊 Profiles found: ${match[1]}`);
          }
        } else {
          console.log('   ⚠️  Result: No profiles found (but query was processed)');
        }
      } else {
        console.log('   ❌ API Error:', response.status);
      }
    } catch (err) {
      console.log('   ❌ Request failed:', err.message);
    }
    
    console.log('');
  }

  console.log('🎯 Test completed! Check server logs for filter debug info.');
}

// Run the test
testSpecificQueries();

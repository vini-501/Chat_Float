// Test queries that should return different numbers of results
const fetch = require('node-fetch');

async function testDifferentResults() {
  console.log('🔬 Testing Different Query Results\n');

  const queries = [
    "Find cold water profiles",  // Should return fewer results
    "Find warm water profiles",  // Should return more results  
    "Show me profiles in the Arabian Sea",  // Geographic filter
    "Recent ARGO profiles"  // General query
  ];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`${i + 1}. "${query}"`);
    
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
        
        // Extract key metrics
        const profileMatch = content.match(/Found \*\*(\d+)\*\* profiles/);
        const tempMatch = content.match(/Temperature range:\*\* ([\d.]+)°C to ([\d.]+)°C/);
        const salMatch = content.match(/Salinity range:\*\* ([\d.]+) to ([\d.]+) PSU/);
        
        console.log(`   📊 Profiles: ${profileMatch ? profileMatch[1] : 'N/A'}`);
        if (tempMatch) {
          console.log(`   🌡️  Temperature: ${tempMatch[1]}°C - ${tempMatch[2]}°C`);
        }
        if (salMatch) {
          console.log(`   🧂 Salinity: ${salMatch[1]} - ${salMatch[2]} PSU`);
        }
        
        // Check if it's a fallback response
        if (content.includes('I can help you analyze')) {
          console.log('   ⚠️  Got fallback response');
        } else if (content.includes("couldn't find any")) {
          console.log('   ❌ No profiles found');
        }
        
      } else {
        console.log('   ❌ API Error:', response.status);
      }
    } catch (err) {
      console.log('   ❌ Request failed:', err.message);
    }
    
    console.log('');
  }
}

// Run the test
testDifferentResults();

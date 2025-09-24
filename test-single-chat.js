// Test a single chat query to see the full response
const fetch = require('node-fetch');

async function testSingleQuery() {
  console.log('🤖 Testing Single FloatChat Query\n');

  const query = "Find ARGO profiles with warm surface temperatures";
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
      console.log('✅ Full Response:');
      console.log('=' .repeat(60));
      console.log(data.data?.content || 'No content');
      console.log('=' .repeat(60));
      console.log(`\nActions available: ${data.data?.actions?.length || 0}`);
      if (data.data?.actions) {
        data.data.actions.forEach((action, i) => {
          console.log(`  ${i + 1}. ${action.label} (${action.type})`);
        });
      }
    } else {
      console.log('❌ Chat API failed:', response.status);
      const errorData = await response.json();
      console.log(`Error: ${errorData.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.log('❌ Request failed:', err.message);
  }
}

// Run the test
testSingleQuery();

// Simple test script to verify MCP and LLM integration
const fetch = require('node-fetch');

async function testChatAPI() {
  console.log('🌊 Testing FloatChat Integration...\n');

  try {
    // Test 1: Chat API Health Check
    console.log('1. Testing Chat API...');
    const chatResponse = await fetch('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello Ocean AI, can you analyze temperature data?',
        mode: 'conversation'
      }),
    });

    if (chatResponse.ok) {
      const chatResult = await chatResponse.json();
      console.log('✅ Chat API working!');
      console.log('Response preview:', chatResult.data?.content?.substring(0, 100) + '...');
    } else {
      console.log('❌ Chat API failed:', chatResponse.status);
    }

    // Test 2: MCP API Health Check  
    console.log('\n2. Testing MCP API...');
    const mcpResponse = await fetch('http://localhost:3002/api/mcp');
    
    if (mcpResponse.ok) {
      const mcpResult = await mcpResponse.json();
      console.log('✅ MCP API working!');
      console.log('Available tools:', mcpResult.availableTools);
    } else {
      console.log('❌ MCP API failed:', mcpResponse.status);
    }

  } catch (error) {
    console.log('❌ Integration test failed:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('   - Run: npm run dev');
    console.log('   - Set up .env.local with API keys');
    console.log('   - Install Python dependencies');
  }
}

// Run the test
testChatAPI();

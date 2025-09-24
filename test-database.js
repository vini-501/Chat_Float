// Test script to verify database integration
const fetch = require('node-fetch');

async function testDatabaseIntegration() {
  console.log('🧪 Testing FloatChat Database Integration...\n');

  try {
    // Test 1: Check if API endpoints are accessible
    console.log('1. Testing API endpoints...');
    
    const profilesResponse = await fetch('http://localhost:3000/api/data/profiles?limit=5');
    if (profilesResponse.ok) {
      const profilesData = await profilesResponse.json();
      console.log('✅ Profiles API working');
      console.log(`   Found ${profilesData.data?.length || 0} profiles`);
    } else {
      console.log('❌ Profiles API failed:', profilesResponse.status);
    }

    const statsResponse = await fetch('http://localhost:3000/api/data/stats');
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Stats API working');
      console.log(`   Total profiles: ${statsData.data?.totalProfiles || 'N/A'}`);
    } else {
      console.log('❌ Stats API failed:', statsResponse.status);
    }

    // Test 2: Test filtered queries
    console.log('\n2. Testing filtered queries...');
    
    const tempResponse = await fetch('http://localhost:3000/api/data/profiles?minTemp=25&limit=3');
    if (tempResponse.ok) {
      const tempData = await tempResponse.json();
      console.log('✅ Temperature filtering working');
      console.log(`   Found ${tempData.data?.length || 0} warm profiles`);
    } else {
      console.log('❌ Temperature filtering failed');
    }

    // Test 3: Test geographic filtering
    const geoResponse = await fetch('http://localhost:3000/api/data/profiles?minLat=10&maxLat=25&minLon=50&maxLon=80&limit=3');
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      console.log('✅ Geographic filtering working');
      console.log(`   Found ${geoData.data?.length || 0} profiles in Arabian Sea region`);
    } else {
      console.log('❌ Geographic filtering failed');
    }

    // Test 4: Test chat API
    console.log('\n3. Testing chat API...');
    
    const chatResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Show me temperature data from the Indian Ocean',
        mode: 'analysis'
      })
    });

    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat API working');
      console.log(`   Response length: ${chatData.data?.content?.length || 0} characters`);
    } else {
      console.log('❌ Chat API failed:', chatResponse.status);
    }

    console.log('\n🎉 Database integration test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('   1. Start the Next.js development server: npm run dev');
    console.log('   2. Ensure Supabase environment variables are set');
    console.log('   3. Check that the database contains ARGO profile data');
  }
}

// Run the test
testDatabaseIntegration();

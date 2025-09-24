// Detailed test script to debug database integration issues
const fetch = require('node-fetch');

async function testWithDetails() {
  console.log('🔍 Detailed Database Integration Test\n');

  try {
    // Test 1: Basic profiles endpoint
    console.log('1. Testing basic profiles endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/data/profiles?limit=5');
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Basic profiles API working');
        console.log(`   Profiles returned: ${data.data?.length || 0}`);
        if (data.data && data.data.length > 0) {
          console.log(`   Sample profile keys: ${Object.keys(data.data[0]).slice(0, 5).join(', ')}`);
        }
      } else {
        console.log('❌ Basic profiles API failed');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
        console.log(`   Details: ${data.details || 'No details'}`);
      }
    } catch (err) {
      console.log('❌ Basic profiles API error:', err.message);
    }

    // Test 2: Geographic filtering with detailed logging
    console.log('\n2. Testing geographic filtering...');
    try {
      const geoUrl = 'http://localhost:3000/api/data/profiles?minLat=10&maxLat=25&minLon=50&maxLon=80&limit=3';
      console.log(`   URL: ${geoUrl}`);
      
      const response = await fetch(geoUrl);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Geographic filtering working');
        console.log(`   Profiles found: ${data.data?.length || 0}`);
        if (data.data && data.data.length > 0) {
          const sample = data.data[0];
          console.log(`   Sample location: ${sample.latitude}°N, ${sample.longitude}°E`);
        }
      } else {
        console.log('❌ Geographic filtering failed');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
        console.log(`   Details: ${data.details || 'No details'}`);
      }
    } catch (err) {
      console.log('❌ Geographic filtering error:', err.message);
    }

    // Test 3: Temperature filtering
    console.log('\n3. Testing temperature filtering...');
    try {
      const tempUrl = 'http://localhost:3000/api/data/profiles?minTemp=25&limit=3';
      console.log(`   URL: ${tempUrl}`);
      
      const response = await fetch(tempUrl);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Temperature filtering working');
        console.log(`   Warm profiles found: ${data.data?.length || 0}`);
        if (data.data && data.data.length > 0) {
          const sample = data.data[0];
          console.log(`   Sample temp: ${sample.shallow_temp_mean || sample.temp_mean || 'N/A'}°C`);
        }
      } else {
        console.log('❌ Temperature filtering failed');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.log('❌ Temperature filtering error:', err.message);
    }

    // Test 4: Stats endpoint
    console.log('\n4. Testing stats endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/data/stats');
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Stats API working');
        console.log(`   Total profiles: ${data.data?.totalProfiles || 'N/A'}`);
        console.log(`   Date range: ${data.data?.dateRange?.earliest || 'N/A'} to ${data.data?.dateRange?.latest || 'N/A'}`);
        console.log(`   Temp range: ${data.data?.temperatureRange?.min || 'N/A'}°C to ${data.data?.temperatureRange?.max || 'N/A'}°C`);
      } else {
        console.log('❌ Stats API failed');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.log('❌ Stats API error:', err.message);
    }

    // Test 5: Database connection test
    console.log('\n5. Testing database connection...');
    try {
      const response = await fetch('http://localhost:3000/api/data/profiles?limit=1');
      const data = await response.json();
      
      if (response.ok && data.data && data.data.length > 0) {
        console.log('✅ Database connection working');
        const profile = data.data[0];
        console.log('   Sample profile structure:');
        Object.keys(profile).slice(0, 10).forEach(key => {
          console.log(`     ${key}: ${profile[key]}`);
        });
      } else {
        console.log('❌ Database connection issue');
        console.log('   No data returned or API error');
      }
    } catch (err) {
      console.log('❌ Database connection error:', err.message);
    }

    console.log('\n🏁 Detailed test completed!');
    console.log('\n💡 If you see errors, check:');
    console.log('   1. Next.js server is running (npm run dev)');
    console.log('   2. Supabase environment variables in .env.local');
    console.log('   3. Database table exists and has data');
    console.log('   4. Network connectivity to Supabase');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the detailed test
testWithDetails();

const fetch = require('node-fetch');

// Test script to verify AI API functionality
async function testAI() {
  try {
    console.log('Testing AI API...');
    
    // First, let's test the server health
    const healthResponse = await fetch('http://localhost:8080/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server health check:', healthData);
    } else {
      console.log('❌ Server health check failed');
      return;
    }
    
    // Test login first (you'll need to create a test user or use existing credentials)
    const loginResponse = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with your test email
        password: 'password123' // Replace with your test password
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed, please create a test user first');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Create a test session
    const sessionResponse = await fetch('http://localhost:8080/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        personName: 'Test Person',
        relationshipType: 'friend'
      })
    });
    
    if (!sessionResponse.ok) {
      console.log('❌ Session creation failed');
      return;
    }
    
    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.session._id;
    console.log('✅ Session created:', sessionId);
    
    // Test AI response
    console.log('\n🤖 Testing AI response...');
    const aiResponse = await fetch('http://localhost:8080/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId: sessionId,
        message: 'Hi, how are you?',
        relationshipType: 'friend'
      })
    });
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      console.log('✅ AI Response:', aiData.data.response);
    } else {
      const errorText = await aiResponse.text();
      console.log('❌ AI Response failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAI();

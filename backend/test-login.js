#!/usr/bin/env node

const http = require('http');

// Test login endpoint
function testLogin(username, password) {
  const postData = JSON.stringify({
    email: username,
    password: password
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log(`\n🔐 Testing login with username: ${username}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('✅ LOGIN SUCCESSFUL!');
          if (response.data && response.data.token) {
            console.log(`✅ Token received: ${response.data.token.substring(0, 20)}...`);
          }
        } else {
          console.log('❌ LOGIN FAILED');
        }
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Connection error:', e.message);
    console.error('Make sure backend is running on port 5000');
  });

  req.write(postData);
  req.end();
}

// Test cases
console.log('📝 INSTAGRAM LOGIN API TEST');
console.log('═══════════════════════════════════════════════════════════');

// Test 1: Valid login
testLogin('jp_2006', 'test123');

// Test 2: Wrong password after 2 seconds
setTimeout(() => {
  testLogin('jp_2006', 'wrongpassword');
}, 2000);

// Test 3: Non-existent user after 4 seconds
setTimeout(() => {
  testLogin('nonexistentuser', 'password123');
}, 4000);

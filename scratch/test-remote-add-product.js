const fs = require('fs');
const path = require('path');

async function testRemote() {
  try {
    console.log("Attempting to login to remote server...");
    const loginResponse = await fetch('https://flower-shop-backend-2ab5.onrender.com/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    if (!loginResponse.ok) {
      console.error("Login failed:", await loginResponse.text());
      return;
    }

    const { token } = await loginResponse.json();
    console.log("Login successful, token received:", token.substring(0, 15) + "...");

    // Create a dummy file buffer to simulate file upload
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    
    // Construct raw multipart form data payload manually
    const payloadParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nTest Product\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="price"\r\n\r\n199.99\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nFlowers\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nTest Description\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\nIMAGE_DATA_HERE\r\n`,
      `--${boundary}--\r\n`
    ];

    const body = Buffer.from(payloadParts.join(''));

    console.log("Sending POST request to add product...");
    const addResponse = await fetch('https://flower-shop-backend-2ab5.onrender.com/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      },
      body: body
    });

    console.log("Response Status:", addResponse.status);
    console.log("Response Text:", await addResponse.text());
  } catch (err) {
    console.error("Fetch request error:", err);
  }
}

testRemote();

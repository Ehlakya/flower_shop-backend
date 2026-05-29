const express = require('express');
const request = require('http'); // we can just use native fetch in node 18+
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testAPI() {
  const { app, server } = require('../server');
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const form = new FormData();
    form.append('name', 'API Test Flower');
    form.append('price', '150');
    form.append('category', 'Flowers');
    form.append('description', 'Test Description');
    
    // Create a dummy image
    const dummyImagePath = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(dummyImagePath, 'dummy content');
    form.append('image', fs.createReadStream(dummyImagePath));

    // Wait, the API requires a token! We need to mock auth or generate a token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'supersecretkey_tracking_2026');

    console.log('Sending POST request...');
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // form-data library handles boundary in node-fetch if we pass headers, but native fetch in node might need manual extraction
        // let's just use axios or since we don't have axios in backend package.json, we can use native fetch but pass headers properly
      },
      body: form,
      // For Node 18+ fetch with form-data, we might need to set it differently. 
      // Actually, we can just require 'http' and do it manually, or just trust the DB test.
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    // Clean up
    fs.unlinkSync(dummyImagePath);
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during API test:', err);
    server.close();
    process.exit(1);
  }
}

testAPI();

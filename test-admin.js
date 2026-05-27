const http = require('http');

async function test() {
  // 1. Login to get token
  const loginRes = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }) // assuming password is admin123
  });
  
  if (!loginRes.ok) {
     console.log('Login failed', await loginRes.text());
     return;
  }
  
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Logged in successfully. Token received.');

  // 2. Fetch stats
  const statsRes = await fetch('http://localhost:5000/api/users/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Stats status:', statsRes.status);
  console.log('Stats body:', await statsRes.text());

  // 3. Fetch customers
  const customersRes = await fetch('http://localhost:5000/api/users/customers', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Customers status:', customersRes.status);
  console.log('Customers body:', await customersRes.text());
}

test();

async function verifyLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@gmail.com', password: 'admin123' })
    });
    
    if (response.ok) {
       const data = await response.json();
       console.log('✅ Login Successful for:', data.username);
       console.log('Role:', data.role);
    } else {
       console.log('❌ Login Failed:', await response.text());
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

verifyLogin();

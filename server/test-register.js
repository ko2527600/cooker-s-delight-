// server/test-register.js
// Test script to verify customer registration

const register = async () => {
  const url = 'https://cookers-delight-api.onrender.com/api/customers/auth/register';
  const data = {
    name: 'Samuel Doe',
    email: 'samuel.doe@gmail.com',
    password: 'Password@2026',
    phone: '0245678901'
  };

  console.log('--- Cookers Delight Registration Test ---');
  console.log(`Target: ${url}`);
  console.log(`Email: ${data.email}`);
  console.log('-----------------------------------------');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ PASS: Registration successful!');
      console.log('Response Status:', response.status);
      console.log('Customer Name:', result.customer.name);
      console.log('Loyalty Points:', result.customer.loyaltyPoints);
      console.log('Token Received:', result.token ? 'Yes' : 'No');
      console.log('Cookie Header:', response.headers.get('set-cookie') ? 'Yes' : 'No');
    } else {
      console.log('❌ FAIL: Registration failed.');
      console.log('Response Status:', response.status);
      console.log('Message:', result.message);
    }
  } catch (err) {
    console.error('💥 FATAL ERROR: Could not connect to the server.');
    console.error('Reason:', err.message);
    console.log('\nTip: Make sure the server is running on port 5000 (npm run dev in /server)');
  }
};

register();

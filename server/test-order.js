// server/test-order.js
// Test script to verify the full ordering flow (Login -> Fetch Menu -> Place Order)

const API_URL = 'https://cookers-delight-api.onrender.com/api';

const runTest = async () => {
  console.log('--- Cookers Delight Ordering Test ---');
  console.log(`Target: ${API_URL}`);
  console.log('-------------------------------------');

  try {
    // 1. Login to get token
    console.log('Step 1: Logging in as Samuel Doe...');
    const loginRes = await fetch(`${API_URL}/customers/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'samuel.doe@gmail.com', 
        password: 'Password@2026' 
      })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    const token = loginData.token;
    console.log('✅ Login successful!');

    // 2. Fetch available menu items
    console.log('\nStep 2: Fetching available menu items...');
    const menuRes = await fetch(`${API_URL}/menu?available=true`);
    const menu = await menuRes.json();
    
    if (!menuRes.ok || !menu.length) {
      throw new Error('Could not fetch menu or menu is empty');
    }
    
    const selectedItem = menu[0];
    console.log(`✅ Selected Item: ${selectedItem.name} (₵${selectedItem.price})`);

    // 3. Place the order
    console.log('\nStep 3: Placing order...');
    const orderPayload = {
      type: 'delivery',
      deliveryAddress: 'Plot 42, Silicon Street, Accra',
      items: [
        { 
          menuItemId: selectedItem.id, 
          quantity: 2, 
          price: parseFloat(selectedItem.price), 
          name: selectedItem.name 
        }
      ],
      totalAmount: (parseFloat(selectedItem.price) * 2) + 15, // +15 for delivery
      paymentMethod: 'cash',
      note: 'Please deliver to the front gate. Test order.'
    };

    const orderRes = await fetch(`${API_URL}/customers/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload)
    });

    const orderResult = await orderRes.json();
    
    if (orderRes.ok) {
      console.log('✅ PASS: Order placed successfully!');
      console.log('Order Number:', orderResult.orderNumber);
      console.log('Current Status:', orderResult.status);
      console.log('Total Amount:', `₵${orderResult.totalAmount}`);
    } else {
      console.log('❌ FAIL: Order placement failed.');
      console.log('Message:', orderResult.message);
    }

  } catch (err) {
    console.error('\n💥 FATAL ERROR during test execution:');
    console.error(err.message);
  }
};

runTest();

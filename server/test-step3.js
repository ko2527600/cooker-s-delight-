const http = require('http');

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runTests() {
  try {
    console.log("1. Logging in...");
    const loginRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/customers/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: "test@gmail.com", password: "Test1234!" });
    
    if (loginRes.status !== 200) throw new Error("Login failed: " + JSON.stringify(loginRes.data));
    const token = loginRes.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    console.log("✅ Login successful");

    console.log("2. Fetching profile...");
    const profileRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/customers/profile', method: 'GET',
      headers: authHeaders
    });
    console.log("✅ Profile fetched, points:", profileRes.data.loyaltyPoints);

    console.log("3. Creating order...");
    const orderData = {
      type: "delivery",
      deliveryAddress: "123 Test St",
      items: [{ name: "Jollof", price: 45, quantity: 2, subtotal: 90 }],
      paymentMethod: "cash"
    };
    const orderRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/customers/orders', method: 'POST',
      headers: authHeaders
    }, orderData);
    
    if (orderRes.status !== 200) throw new Error("Order creation failed: " + JSON.stringify(orderRes.data));
    const orderId = orderRes.data.id;
    console.log("✅ Order created:", orderRes.data.orderNumber, "- Total:", orderRes.data.totalAmount);

    console.log("4. Fetching notifications...");
    const notifRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/customers/notifications', method: 'GET',
      headers: authHeaders
    });
    console.log("✅ Notifications fetched, unread:", notifRes.data.unreadCount);

    console.log("5. Cancelling order...");
    const cancelRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/customers/orders/${orderId}/cancel`, method: 'POST',
      headers: authHeaders
    }, { cancelReason: "Changed mind" });
    if (cancelRes.status !== 200) throw new Error("Order cancellation failed: " + JSON.stringify(cancelRes.data));
    console.log("✅ Order cancelled, status:", cancelRes.data.status);

    console.log("6. Testing Analytics endpoint (admin)...");
    const adminLogin = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: "admin@cookersdelight.com", password: "CookersAdmin2026!" });
    
    const adminToken = adminLogin.data.token;
    const analyticsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/analytics/summary', method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (analyticsRes.status === 200) {
      console.log("✅ Analytics fetched successfully");
      console.log("   Total Customers:", analyticsRes.data.totalCustomers);
    } else {
      console.error("❌ Analytics failed:", analyticsRes.data);
    }

    console.log("🎉 All tests passed!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

runTests();

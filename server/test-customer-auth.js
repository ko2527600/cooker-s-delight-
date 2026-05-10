const http = require('http');

const testRegister = () => {
  const data = JSON.stringify({
    name: "Test Customer",
    email: "test@gmail.com",
    password: "Test1234!",
    phone: "+233201234567"
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/customers/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log('Register Status:', res.statusCode);
    res.on('data', (d) => {
      const resp = JSON.parse(d);
      console.log('Register Response:', resp);
      if (res.statusCode === 200) {
        testLogin();
      }
    });
  });

  req.on('error', (e) => console.error('Register Error:', e));
  req.write(data);
  req.end();
};

const testLogin = () => {
  const data = JSON.stringify({
    email: "test@gmail.com",
    password: "Test1234!"
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/customers/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log('Login Status:', res.statusCode);
    res.on('data', (d) => {
      console.log('Login Response:', JSON.parse(d));
    });
  });

  req.on('error', (e) => console.error('Login Error:', e));
  req.write(data);
  req.end();
};

testRegister();

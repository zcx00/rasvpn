const fetch = require('node-fetch');
fetch('http://localhost:3000/api/v1/admin/marzban/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'http://89.22.225.206:8080', username: 'admin', password: '1234Admin' })
}).then(res => res.text()).then(console.log).catch(console.error);

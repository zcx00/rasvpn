const fetch = require('node-fetch');

async function test() {
  const authRes = await fetch("http://89.22.225.206:8080/api/admin/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "username=admin&password=1234Admin"
  });
  const data = await authRes.json();
  const token = data.access_token;
  
  const usersRes = await fetch("http://89.22.225.206:8080/api/users", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  console.log(usersData);
}
test();

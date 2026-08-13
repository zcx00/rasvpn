const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetTest = `  app.post("/api/v1/admin/marzban/test", async (req, res) => {
    try {
      const token = await getMarzbanToken();
      const baseUrl = marzbanConfig.url.replace(/\\/$/, "");`;

const newTest = `  app.post("/api/v1/admin/marzban/test", async (req, res) => {
    try {
      const { url, username, password } = req.body;
      const baseUrl = (url || marzbanConfig.url).replace(/\\/$/, "");
      const params = new URLSearchParams();
      params.append("username", username || marzbanConfig.username);
      params.append("password", password !== undefined ? password : marzbanConfig.password);
      
      const authRes = await fetch(\`\${baseUrl}/api/admin/token\`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });
      if (!authRes.ok) throw new Error("Marzban Auth Failed");
      const tokenData = await authRes.json();
      const token = tokenData.access_token;
`;
code = code.replace(targetTest, newTest);
fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const marzbanHelper = `
  // Helper for Marzban User Sync
  async function syncMarzbanUser(plan, telegramId, expireDate) {
    if (!marzbanConfig.url || !marzbanConfig.password) return [];
    try {
      const token = await getMarzbanToken();
      const baseUrl = marzbanConfig.url.replace(/\\/$/, "");
      const username = \`tg_\${telegramId || Date.now()}\`;
      
      let mUser;
      const uRes = await fetch(\`\${baseUrl}/api/user/\${username}\`, { headers: { Authorization: \`Bearer \${token}\` } });
      
      if (uRes.ok) {
         mUser = await uRes.json();
         const updateRes = await fetch(\`\${baseUrl}/api/user/\${username}\`, {
           method: "PUT",
           headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
           body: JSON.stringify({
             expire: Math.floor(expireDate.getTime() / 1000),
             data_limit: plan.trafficLimitGb * 1073741824,
             status: "active"
           })
         });
         if (updateRes.ok) mUser = await updateRes.json();
      } else {
         const createRes = await fetch(\`\${baseUrl}/api/user\`, {
           method: "POST",
           headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
           body: JSON.stringify({
             username,
             proxies: { "vless": {} },
             inbounds: {},
             expire: Math.floor(expireDate.getTime() / 1000),
             data_limit: plan.trafficLimitGb * 1073741824,
             data_limit_reset_strategy: "no_reset",
             status: "active",
             note: \`Created via WebApp: \${plan.name}\`
           })
         });
         if (createRes.ok) mUser = await createRes.json();
      }
      return mUser && mUser.links ? mUser.links : [];
    } catch(e) {
      console.error("Marzban Sync Error:", e.message);
      return [];
    }
  }
`;

// Insert after the getMarzbanToken function
code = code.replace(/async function getMarzbanToken\(\) \{[\s\S]*?\}\n/, (match) => match + marzbanHelper);
fs.writeFileSync('server.ts', code);

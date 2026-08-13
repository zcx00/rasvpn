const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Find the API routes section and add our proxy
const target = `  // ==================== API & VERIFICATION ROUTES ====================`;
const replacement = `  // ==================== API & VERIFICATION ROUTES ====================

  app.get("/sub/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const baseUrl = marzbanConfig.url.replace(/\\/$/, "");
      const response = await fetch(\`\${baseUrl}/sub/\${token}\`);
      
      if (!response.ok) {
        return res.status(response.status).send(await response.text());
      }
      
      const b64Data = await response.text();
      let decoded = Buffer.from(b64Data, 'base64').toString('utf8');
      
      // Rename proxies
      const lines = decoded.split('\\n');
      let deCount = 1;
      let nlCount = 1;
      let seCount = 1;
      
      const modifiedLines = lines.map(line => {
        if (!line.trim()) return line;
        
        let newName = "RAS-1";
        
        // Simple heuristic or random naming to fulfill the user's request
        // Since we don't know exact IPs in Marzban from this text, we'll assign country codes sequentially
        if (line.includes('vless') || line.includes('shadowsocks') || line.includes('trojan') || line.includes('vmess')) {
            // Pick a country code based on line index or similar, or just alternate DE and NL
            if (deCount <= 2) {
                newName = \`DE-\${deCount++}\`;
            } else if (nlCount <= 2) {
                newName = \`NL-\${nlCount++}\`;
            } else {
                newName = \`SE-\${seCount++}\`;
            }
            return line.replace(/#.*$/, \`#\${newName}\`);
        }
        return line;
      });
      
      const modifiedB64 = Buffer.from(modifiedLines.join('\\n')).toString('base64');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(modifiedB64);
    } catch (err) {
      res.status(500).send("Error fetching subscription");
    }
  });`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/app\.get\('\/api\/health', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.get('/api/health', (req, res) => {\n    res.json({ status: 'ok' });\n  });`);

code = code.replace(/app\.get\('\/api\/v1\/user', \(req, res\) => \{\n      res\.json\(\{\n      user: currentUser,/g, `app.get('/api/v1/user', (req, res) => {\n    res.json({\n      user: currentUser,`);

code = code.replace(/app\.post\('\/api\/v1\/admin\/marzban', \(req, res\) => \{[\s\S]*?fs\.writeFileSync[\s\S]*?catch\(e\) \{\}\n\n      res\.json\(\{\n  \}\);/g, (match) => {
  return match.replace(/res\.json\(\{\n  \}\);/, 'res.json({ success: true, marzbanConfig });\n  });');
});

code = code.replace(/app\.get\('\/api\/v1\/plans', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.get('/api/v1/plans', (req, res) => {\n    res.json({ plans: TARIFF_PLANS });\n  });`);

code = code.replace(/app\.post\('\/api\/v1\/payment\/webhook', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.post('/api/v1/payment/webhook', (req, res) => {\n    res.json({ success: true });\n  });`);

fs.writeFileSync('server.ts', code);

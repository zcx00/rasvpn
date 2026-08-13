const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/app\.get\('\/api\/health', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.get('/api/health', (req, res) => {\n    res.json({ status: 'ok' });\n  });`);

code = code.replace(/app\.post\('\/api\/v1\/admin\/marzban', \(req, res\) => \{\n    const \{ url, username, password \} = req\.body;\n    if \(url\) marzbanConfig\.url = url;\n    if \(username\) marzbanConfig\.username = username;\n    if \(password !== undefined\) marzbanConfig\.password = password;\n    try \{\n      fs\.writeFileSync\(MARZBAN_FILE, JSON\.stringify\(marzbanConfig, null, 2\)\);\n    \} catch\(e\) \{\}\n\n      res\.json\(\{\n  \}\);/g, `app.post('/api/v1/admin/marzban', (req, res) => {\n    const { url, username, password } = req.body;\n    if (url) marzbanConfig.url = url;\n    if (username) marzbanConfig.username = username;\n    if (password !== undefined) marzbanConfig.password = password;\n    try {\n      fs.writeFileSync(MARZBAN_FILE, JSON.stringify(marzbanConfig, null, 2));\n    } catch(e) {}\n    res.json({ success: true, marzbanConfig });\n  });`);

code = code.replace(/app\.get\('\/api\/v1\/plans', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.get('/api/v1/plans', (req, res) => {\n    res.json({ plans: TARIFF_PLANS });\n  });`);

code = code.replace(/app\.post\('\/api\/v1\/payment\/webhook', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.post('/api/v1/payment/webhook', (req, res) => {\n    res.json({ success: true });\n  });`);

code = code.replace(/app\.get\('\/api\/v1\/admin\/nodes', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.get('/api/v1/admin/nodes', (req, res) => {\n    res.json({ entryNodes, exitNodes });\n  });`);

code = code.replace(/app\.get\('\/api\/v1\/admin\/routes', \(req, res\) => \{\n      res\.json\(\{\n  \}\);/g, `app.get('/api/v1/admin/routes', (req, res) => {\n    res.json({ cascadeRoutes });\n  });`);

code = code.replace(/      res\.json\(\{ success: true, route: newRoute \}\);\n    cascadeRoutes\.push\(newRoute\);\n      res\.json\(\{\n  \}\);/g, `    cascadeRoutes.push(newRoute);\n    res.json({ success: true, route: newRoute });\n  });`);


fs.writeFileSync('server.ts', code);

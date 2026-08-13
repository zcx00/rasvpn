const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/app\.post\("\/api\/v1\/admin\/marzban", \(req, res\) => \{\n    const \{ url, username, password \} = req\.body;\n    if \(url\) marzbanConfig\.url = url;\n    if \(username\) marzbanConfig\.username = username;\n    if \(password !== undefined\) marzbanConfig\.password = password;\n    try \{\n      fs\.writeFileSync\(MARZBAN_FILE, JSON\.stringify\(marzbanConfig, null, 2\)\);\n    \} catch\(e\) \{\}\n      res\.json\(\{\n  \}\);/g, `app.post("/api/v1/admin/marzban", (req, res) => {\n    const { url, username, password } = req.body;\n    if (url) marzbanConfig.url = url;\n    if (username) marzbanConfig.username = username;\n    if (password !== undefined) marzbanConfig.password = password;\n    try {\n      fs.writeFileSync(MARZBAN_FILE, JSON.stringify(marzbanConfig, null, 2));\n    } catch(e) {}\n    res.json({ success: true, marzbanConfig });\n  });`);

fs.writeFileSync('server.ts', code);

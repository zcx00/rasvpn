const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "[{ text: '💬 Техподдержка', url: 'https://t.me/rasvpn_manager' }],",
  "[{ text: '💬 Техподдержка', url: 'https://t.me/zcx002' }],"
);

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('app.post("/api/v1/admin/marzban/test"')) {
    if (lines[i-1].includes('  });') && lines[i-2].includes('      res.json({')) {
       lines[i-2] = '    res.json({ success: true });';
    }
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

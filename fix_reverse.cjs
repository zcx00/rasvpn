const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('res.json({ success: true });')) {
     lines[i] = '      res.json({';
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

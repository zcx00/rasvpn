const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'res.json({') {
     lines[i] = '      res.json({ success: true });';
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

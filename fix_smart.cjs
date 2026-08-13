const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('res.json({')) {
     if (lines[i+1] && lines[i+1].trim() === '});') {
       lines[i] = '      res.json({ success: true });';
       lines[i+1] = ''; // remove the extra closing since it's now closed
     }
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

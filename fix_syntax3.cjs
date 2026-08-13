const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('res.json({') && lines[i].trim() === 'res.json({') {
     if (lines[i+1] && lines[i+1].includes('res.json({ success: true, node: newNode });')) {
       lines[i] = ''; // remove duplicate
     }
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

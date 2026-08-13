const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('res.json({') && lines[i].trim() === 'res.json({') {
    if (lines[i+1] && lines[i+1].includes('});')) {
      lines[i] = '      res.json({ success: true });';
      lines[i+1] = ''; // remove extra closing bracket since it's now on one line
    }
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

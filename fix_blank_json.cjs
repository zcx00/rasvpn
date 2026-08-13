const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('res.json({')) {
     // If next line is empty, remove it
     if (lines[i+1] !== undefined && lines[i+1].trim() === '') {
        lines.splice(i+1, 1);
     }
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

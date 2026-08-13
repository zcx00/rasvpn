const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('res.json({') && lines[i+1] && lines[i+1].includes('} catch (err: any) {')) {
    lines[i] = '      res.json({ success: true, message: "Успешное подключение к Marzban!" });';
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));

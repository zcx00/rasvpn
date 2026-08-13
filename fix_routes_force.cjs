const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("recommendedFor: ['Высокая скорость', 'Защита'],")) {
    lines[i+1] = '    };';
    lines[i+2] = '    cascadeRoutes.push(newRoute);';
    lines[i+3] = '    res.json({ success: true, route: newRoute });';
    lines[i+4] = '  });';
  }
}

fs.writeFileSync('server.ts', lines.join('\n'));

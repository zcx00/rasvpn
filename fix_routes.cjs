const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/      recommendedFor: \['Высокая скорость', 'Защита'\],\n      res\.json\(\{ success: true, route: newRoute \}\);\n    cascadeRoutes\.push\(newRoute\);\n      res\.json\(\{\n  \}\);/g, `      recommendedFor: ['Высокая скорость', 'Защита'],\n    };\n    cascadeRoutes.push(newRoute);\n    res.json({ success: true, route: newRoute });\n  });`);

fs.writeFileSync('server.ts', code);

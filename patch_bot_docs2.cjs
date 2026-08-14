const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace("⚡ Максимальная скорость без ограничений", "⚡ Максимальная скорость соединения");

fs.writeFileSync('server.ts', code);

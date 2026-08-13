const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');
code = code.replace(/<Users className="w-4 h-4" \/>\s*<span>Пользователи \(VLESS\)<\/span>/g, '<Users className="w-4 h-4" />\n          <span>Пользователи (VLESS)</span>');
fs.writeFileSync('src/components/AdminPanel.tsx', code);

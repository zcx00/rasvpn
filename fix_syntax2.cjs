const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');
code = code.replace(/<\/div>\s*<\/div>v>\s*<\/div>/g, '</div>');
fs.writeFileSync('src/components/AdminPanel.tsx', code);

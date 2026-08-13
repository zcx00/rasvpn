const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/res\.json\(\{\n    \} else \{/g, 'res.json({ success: true, node: newNode });\n    } else {');
code = code.replace(/res\.json\(\{\n    \}\n  \}\);\n\n  \/\/ Admin: Get \/ Update Cascade Routes/g, 'res.json({ success: true, node: newNode });\n    }\n  });\n\n  // Admin: Get / Update Cascade Routes');
fs.writeFileSync('server.ts', code);

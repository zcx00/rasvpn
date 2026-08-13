const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
if (!code.includes('dotenv')) {
  code = "import dotenv from 'dotenv';\ndotenv.config();\n" + code;
  fs.writeFileSync('server.ts', code);
}

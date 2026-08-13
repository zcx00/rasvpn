const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const systemRes = await fetch\(`\$\{baseUrl\}\/api\/system`, \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \}\);\nres.json\(\{\n    \} catch \(err: any\) \{/g, `const systemRes = await fetch(\`\${baseUrl}/api/system\`, { headers: { Authorization: \`Bearer \${token}\` } });\n      res.json({ success: true, message: "Успешное подключение к Marzban!" });\n    } catch (err: any) {`);

fs.writeFileSync('server.ts', code);

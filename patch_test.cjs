const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
const searchStr = `      const systemRes = await fetch(\`\${baseUrl}/api/system\`, { headers: { Authorization: \`Bearer \${token}\` } });
res.json({
    } catch (err: any) {`;

const replaceStr = `      const systemRes = await fetch(\`\${baseUrl}/api/system\`, { headers: { Authorization: \`Bearer \${token}\` } });
      res.json({ success: true, message: "Успешное подключение к Marzban!" });
    } catch (err: any) {`;

code = code.replace(searchStr, replaceStr);
fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `      let usersData = [];
      if (usersRes.ok) usersData = await usersRes.json();`;

const replacement = `      let usersData = [];
      if (usersRes.ok) {
        const d = await usersRes.json();
        usersData = Array.isArray(d) ? d : (d.users || []);
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);

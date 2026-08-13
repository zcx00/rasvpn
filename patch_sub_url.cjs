const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The original URL generation
const target = "subscriptionUrl: \`https://sub.rasvpna.ru/sub/\${userToken}\`,";
const replacement = "subscriptionUrl: \`\${process.env.APP_URL || ('http://' + req.get('host'))}/sub/\${userToken}\`,";

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);

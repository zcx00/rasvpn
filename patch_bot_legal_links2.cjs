const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `      const appHost = webAppUrl.replace(/\\/$/, '');
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Открыть Web App', web_app: { url: appHost } }],
            [{ text: '💬 Техподдержка', url: 'https://t.me/rasvpn_manager' }],
            [{ text: '📚 Инструкция', url: 'https://telegra.ph/nastroika-rasvpn' }],
            [{ text: '📜 Пользовательское соглашение', url: \`\${appHost}/terms\` }],
            [{ text: '🔐 Политика конфиденциальности', url: \`\${appHost}/privacy\` }]
          ]
        }
      };`;

const replacement = `      const appHost = webAppUrl.replace(/\\/$/, '');
      const baseDomain = process.env.BASE_DOMAIN || 'https://sub.rasvpna.ru'; // fallback for legal links
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Открыть Web App', web_app: { url: appHost } }],
            [{ text: '💬 Техподдержка', url: 'https://t.me/rasvpn_manager' }],
            [{ text: '📚 Инструкция', url: 'https://telegra.ph/nastroika-rasvpn' }],
            [{ text: '📜 Пользовательское соглашение', url: \`\${baseDomain}/terms\` }],
            [{ text: '🔐 Политика конфиденциальности', url: \`\${baseDomain}/privacy\` }]
          ]
        }
      };`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);

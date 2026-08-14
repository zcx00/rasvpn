const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetOptions = `      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Открыть Web App', web_app: { url: webAppUrl } }],
            [{ text: '💬 Техподдержка', url: 'https://t.me/rasvpn_manager' }],
            [{ text: '📚 Инструкция', url: 'https://telegra.ph/nastroika-rasvpn' }],
            [{ text: '📜 Пользовательское соглашение', url: 'https://telegra.ph/Polzovatelskoe-soglashenie-08-01-39' }],
            [{ text: '🔐 Политика конфиденциальности', url: 'https://telegra.ph/Politika-konfidencialnosti-08-01-83' }]
          ]
        }
      };`;

const replacementOptions = `      const appHost = webAppUrl.replace(/\\/$/, '');
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

code = code.replace(targetOptions, replacementOptions);
fs.writeFileSync('server.ts', code);

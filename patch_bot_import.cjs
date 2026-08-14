const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "import TelegramBot from 'node-telegram-bot-api';",
  "import * as TelegramBotModule from 'node-telegram-bot-api';\nconst TelegramBot = (TelegramBotModule as any).default || TelegramBotModule;"
);

fs.writeFileSync('server.ts', code);

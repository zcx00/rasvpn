const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "import * as TelegramBotModule from 'node-telegram-bot-api';\nconst TelegramBot = (TelegramBotModule as any).default || TelegramBotModule;",
  "const TelegramBot = require('node-telegram-bot-api');"
);

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Insert bot import at top
code = code.replace(
  "import express from 'express';", 
  "import express from 'express';\nimport TelegramBot from 'node-telegram-bot-api';"
);

// Insert bot initialization after APP_URL config or similar
const target = "const invoicesStore = new Map<string, any>();";
const replacement = `const invoicesStore = new Map<string, any>();

// Initialize Telegram Bot
let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    
    bot.onText(/\\/start/, (msg) => {
      const chatId = msg.chat.id;
      const webAppUrl = process.env.APP_URL || 'https://t.me/rasvpn_bot/app'; // Adjust with real shortname if needed
      
      const welcomeText = "👋 Добро пожаловать в RASvpn!\\n\\n" +
"Ваш личный кабинет, выбор тарифов и управление подпиской находятся прямо в Mini App. \\n\\n" +
"🚀 Что умеет RASvpn:\\n" +
"⚡ Максимальная скорость без урезания трафика\\n" +
"🛡 Защита ваших данных в публичных Wi-Fi сетях\\n" +
"📱 Работа на iOS, Android, Windows и macOS\\n" +
"🎯 Стабильная работа любых сервисов и видео в 4K\\n\\n" +
"📌 Как подключиться?\\n" +
"1️⃣ Нажмите кнопку «🚀 Открыть Web App» (или «Меню» слева внизу)\\n" +
"2️⃣ Выберите тариф или активируйте пробный период\\n" +
"3️⃣ Скопируйте ключ и следуйте простой инструкции в приложении\\n\\n" +
"❓ Остались вопросы или нужна помощь? \\n" +
"Нажмите кнопку «💬 Поддержка» ниже.";

      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Открыть Web App', web_app: { url: webAppUrl } }],
            [{ text: '💬 Техподдержка', url: 'https://t.me/rasvpn_support' }],
            [{ text: '📢 Наш Telegram-канал', url: 'https://t.me/rasvpn_news' }],
            [{ text: '📚 Инструкция по настройке', url: 'https://telegra.ph/nastroika-rasvpn' }]
          ]
        }
      };
      
      bot.sendMessage(chatId, welcomeText, options);
    });
    
    console.log("Telegram Bot started in polling mode.");
  } catch(e) {
    console.error("Failed to start telegram bot:", e);
  }
}
`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);

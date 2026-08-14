const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `      const welcomeText = "👋 Добро пожаловать в RASvpn!\\n\\n" +
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
      };`;

const replacement = `      const welcomeText = "👋 Добро пожаловать в RASvpn!\\n\\n" +
"Ваш личный кабинет, выбор тарифов и управление подпиской находятся прямо в Mini App. \\n\\n" +
"🚀 Что умеет RASvpn:\\n" +
"⚡ Максимальная скорость без ограничений\\n" +
"🛡 Защита ваших данных в публичных Wi-Fi сетях\\n" +
"📱 Работа на iOS, Android, Windows и macOS\\n" +
"🎯 Стабильная работа любых сервисов и видео в 4K\\n\\n" +
"📌 Как подключиться?\\n" +
"1️⃣ Нажмите кнопку «🚀 Открыть Web App» (или «Меню» слева внизу)\\n" +
"2️⃣ Выберите тариф или активируйте пробный период\\n" +
"3️⃣ Скопируйте ключ и следуйте простой инструкции в приложении\\n\\n" +
"❓ Остались вопросы или нужна помощь? \\n" +
"Нажмите кнопку «💬 Поддержка» ниже.\\n\\n" +
"Кодовое слово для банка: plat chek";

      const options = {
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

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);

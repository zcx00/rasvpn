import TelegramBotPkg from 'node-telegram-bot-api';
console.log('default type:', typeof TelegramBotPkg);
const TelegramBot = (TelegramBotPkg as any).default || TelegramBotPkg;
console.log('constructor type:', typeof TelegramBot);

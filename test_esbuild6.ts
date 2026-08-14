import pkg from 'node-telegram-bot-api';
const TelegramBot = pkg.default || (pkg as any).TelegramBot || pkg;
console.log('type:', typeof TelegramBot);
const bot = new (TelegramBot as any)('token', { polling: false });
console.log('bot created');

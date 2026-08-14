import TelegramBot from 'node-telegram-bot-api';
console.log(typeof TelegramBot);
const bot = new TelegramBot('token', { polling: false });

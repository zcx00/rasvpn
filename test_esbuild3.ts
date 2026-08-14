import * as TelegramBotModule from 'node-telegram-bot-api';
const TelegramBot = (TelegramBotModule as any).default || TelegramBotModule;
console.log(typeof TelegramBot);
const bot = new (TelegramBot as any)('token', { polling: false });

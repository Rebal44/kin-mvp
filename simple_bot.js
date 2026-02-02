const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🟢 KIN Bot starting...');

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  
  console.log(`[${new Date().toISOString()}] Message from ${chatId}: ${text}`);
  
  bot.sendMessage(chatId, 'KIN System Online. Building in background...');
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

console.log('✅ Bot is running and listening for messages');

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import Redis from 'ioredis';

// Load environment variables
dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(token, { polling: true });
console.log('🤖 KIN Bot initialized');

// User sessions cache
const userSessions = new Map();

// System prompt for KIN
const SYSTEM_PROMPT = `You are KIN, a personal AI assistant that helps users get things done.
You can:
- Book restaurants and appointments
- Order products online
- Set reminders and manage tasks
- Make calls on behalf of users
- Handle various errands

Be helpful, efficient, and friendly. Always confirm actions before executing them.
If you need more information, ask the user.`;

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const username = msg.from?.username || msg.from?.first_name || 'User';
  
  console.log(`[${new Date().toISOString()}] ${username}: ${text}`);
  
  // Ignore commands for now
  if (text.startsWith('/')) {
    handleCommand(msg);
    return;
  }
  
  try {
    // Get or create user
    let user = await prisma.user.findFirst({
      where: { telegramId: String(chatId) }
    });
    
    if (!user) {
      // New user - welcome them
      const welcomeMsg = `👋 Welcome to KIN, ${username}!

I'm your personal AI assistant. I can help you:
🍽️ Book restaurants
🛒 Order products  
📞 Make calls
⏰ Set reminders
📋 Handle errands

What would you like me to do for you?`;
      
      user = await prisma.user.create({
        data: {
          telegramId: String(chatId),
          name: username,
          email: `telegram_${chatId}@kin.ai`,
          password: 'telegram-auth',
          credits: 50 // Free starter credits
        }
      });
      
      await bot.sendMessage(chatId, welcomeMsg);
      return;
    }
    
    // Check credits
    if (user.credits <= 0) {
      await bot.sendMessage(chatId, 
        `⚠️ You've used all your credits. Visit ${process.env.WEB_URL}/pricing to add more.`);
      return;
    }
    
    // Get conversation history
    let history = userSessions.get(chatId) || [];
    history.push({ role: 'user', content: text });
    
    // Generate AI response
    let response;
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-10) // Keep last 10 messages for context
        ],
        temperature: 0.7
      });
      response = completion.choices[0].message.content;
    } else {
      // Fallback response without AI
      response = `I received: "${text}"\n\n🔧 AI responses require OpenAI API key to be configured. For now, I'm in basic mode.`;
    }
    
    history.push({ role: 'assistant', content: response });
    userSessions.set(chatId, history);
    
    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    });
    
    // Send response
    await bot.sendMessage(chatId, response);
    
    // Log task
    await prisma.task.create({
      data: {
        description: text,
        type: 'telegram_chat',
        status: 'completed',
        userId: user.id,
        metadata: { response, creditsUsed: 1 }
      }
    });
    
  } catch (error) {
    console.error('Bot error:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle commands
async function handleCommand(msg) {
  const chatId = msg.chat.id;
  const command = msg.text.split(' ')[0];
  
  switch (command) {
    case '/start':
      await bot.sendMessage(chatId, '👋 Welcome to KIN! Send me any task and I\'ll help you get it done.');
      break;
    case '/help':
      await bot.sendMessage(chatId, 
        `Available commands:
/start - Start KIN
/help - Show this help
/status - Check your credits
/tasks - View your recent tasks`);
      break;
    case '/status':
      const user = await prisma.user.findFirst({
        where: { telegramId: String(chatId) },
        select: { credits: true }
      });
      await bot.sendMessage(chatId, `💳 Credits remaining: ${user?.credits || 0}`);
      break;
    default:
      await bot.sendMessage(chatId, 'Unknown command. Type /help for available commands.');
  }
}

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

console.log('✅ KIN Bot is running and listening for messages');

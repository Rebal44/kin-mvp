import { Router } from 'express';
import { prisma } from '@kin/db';
import { taskQueue } from '../lib/queue';

const router = Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string | number, text: string) {
  if (!BOT_TOKEN) {
    console.log('[Telegram] No bot token configured');
    return;
  }
  
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}

// POST /webhooks/telegram
router.post('/telegram', async (req, res) => {
  // Acknowledge immediately
  res.sendStatus(200);
  
  const update = req.body;
  
  if (!update.message) return;
  
  const { message } = update;
  const chatId = message.chat.id;
  const text = message.text || '';
  const telegramUserId = String(message.from.id);
  const username = message.from.username;
  const firstName = message.from.first_name;
  
  console.log(`[Telegram] ${username || telegramUserId}: ${text}`);
  
  // Handle /start
  if (text.startsWith('/start')) {
    const token = text.split(' ')[1];
    
    if (token) {
      // Handle linking
      try {
        const linkToken: any = await prisma.$queryRaw`
          SELECT * FROM link_tokens 
          WHERE token = ${token} 
          AND used_at IS NULL 
          AND expires_at > NOW()
        `;
        
        if (!linkToken || !linkToken[0]) {
          await sendTelegramMessage(chatId, '❌ Invalid or expired link. Please try again.');
          return;
        }
        
        const { user_id } = linkToken[0];
        
        // Create or update Telegram link
        await prisma.telegramLink.upsert({
          where: { telegramUserId },
          update: { userId: user_id, telegramUsername: username },
          create: {
            userId: user_id,
            telegramUserId,
            telegramUsername: username
          }
        });
        
        // Mark token as used
        await prisma.$executeRaw`
          UPDATE link_tokens 
          SET used_at = NOW() 
          WHERE token = ${token}
        `;
        
        await sendTelegramMessage(
          chatId,
          `✅ <b>Connected!</b>\n\nWelcome to KIN, ${firstName || username || 'there'}! 🎉\n\nYou can now send me tasks and I'll get them done.`
        );
      } catch (error) {
        console.error('Linking error:', error);
        await sendTelegramMessage(chatId, '❌ Something went wrong. Please try again.');
      }
    } else {
      await sendTelegramMessage(
        chatId,
        `👋 <b>Welcome to KIN!</b>\n\nSign up at our web app and connect your Telegram to get started.`
      );
    }
    return;
  }
  
  // Check if user is linked
  try {
    const link = await prisma.telegramLink.findUnique({
      where: { telegramUserId },
      include: { user: true }
    });
    
    if (!link) {
      await sendTelegramMessage(
        chatId,
        '❌ Not connected. Please sign up at our web app and connect your Telegram first.'
      );
      return;
    }
    
    // Check credits
    if (link.user.credits < 5) {
      await sendTelegramMessage(
        chatId,
        '❌ Insufficient credits. Please upgrade your plan.'
      );
      return;
    }
    
    // Create task
    const task = await prisma.task.create({
      data: {
        userId: link.userId,
        request: text,
        status: 'PENDING',
        source: 'TELEGRAM',
        telegramMessageId: String(message.message_id)
      }
    });
    
    // Add to queue
    await taskQueue.add('execute-task', {
      taskId: task.id,
      userId: link.userId,
      request: text
    });
    
    await sendTelegramMessage(
      chatId,
      `✅ <b>Task created:</b> #${task.id.slice(0, 8)}\n\nI'll work on this and reply when done!`
    );
  } catch (error) {
    console.error('Task creation error:', error);
    await sendTelegramMessage(chatId, '❌ Failed to create task. Please try again.');
  }
});

// POST /webhooks/setup-telegram-webhook
router.post('/setup-telegram-webhook', async (req, res) => {
  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  }
  
  const webhookUrl = `${process.env.WEB_URL || req.protocol + '://' + req.headers.host}/webhooks/telegram`;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      res.json({ success: true, webhookUrl });
    } else {
      res.status(500).json({ error: data.description });
    }
  } catch (error) {
    console.error('Webhook setup error:', error);
    res.status(500).json({ error: 'Failed to set webhook' });
  }
});

export { router as webhooksRouter };

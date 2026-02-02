import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';

// Load environment variables
const result = dotenv.config({ path: '../.env' });
if (result.error) {
  dotenv.config(); // Try current directory
}

const app = express();
const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL || '*', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, credits: 100 }
    });
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret');
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, credits: user.credits } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret');
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, credits: user.credits } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User routes
app.get('/user/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, credits: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Stripe routes
app.post('/stripe/create-checkout', authenticate, async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });
  
  try {
    const { priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.WEB_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEB_URL}/pricing`,
      client_reference_id: req.user.userId
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Tasks routes
app.post('/tasks', authenticate, async (req, res) => {
  try {
    const { description, type } = req.body;
    const task = await prisma.task.create({
      data: {
        description,
        type: type || 'general',
        status: 'pending',
        userId: req.user.userId
      }
    });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Telegram webhook
app.post('/webhooks/telegram', async (req, res) => {
  // Forward to bot service or process here
  console.log('Telegram webhook received:', req.body);
  res.sendStatus(200);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 KIN API running on port ${PORT}`);
});

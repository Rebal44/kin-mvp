import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@kin/db';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const SALT_ROUNDS = 10;

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user with free trial credits
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        credits: 50, // Free trial credits
        plan: 'FREE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        plan: true,
        createdAt: true
      }
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_registered',
        details: { email },
        ipAddress: req.ip
      }
    });
    
    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        plan: user.plan
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export { router as authRouter };

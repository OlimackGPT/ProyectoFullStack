const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    console.log('Fetched users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/users',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        console.error('User already exists with email:', email);
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });
      console.log('New user created:', newUser);
      res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (error) {
      console.error('Error creating user:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

app.post('/login',
  [
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      console.log('Attempting login for email:', email);
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error('User not found with email:', email);
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      console.log('User found:', user);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.error('Password does not match for user:', email);
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      console.log('Login successful for user:', email);
      res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
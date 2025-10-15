import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import authMiddleware from './authMiddleware.js';
import { Todos, Users } from './models.js';


const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const PORT = process.env.PORT || 3000;

// --- AUTH ROUTES ---

// Register user
app.post('/api/register', (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = Users.findByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = Users.create(username, hashedPassword);
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Login user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = Users.findByUsername(username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// --- TODO ROUTES (Protected) ---

app.get('/api/todos', authMiddleware, (req, res) => {
  const todos = Todos.findAllByUser(req.user.userId);
  res.json(todos);
});

app.post('/api/todos', authMiddleware, (req, res) => {
  const { task } = req.body;
  const todo = Todos.create(req.user.userId, task);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', authMiddleware, (req, res) => {
  const todo = Todos.findTodoById(req.params.id);
  if (!todo || todo.userId !== req.user.userId) {
    return res.status(404).json({ error: 'Todo not found or not owned by user' });
  }

  const updated = Todos.toggleComplete(req.params.id, req.body);
  res.json(updated);
});

app.delete('/api/todos/:id', authMiddleware, (req, res) => {
  const todo = Todos.findTodoById(req.params.id);
  if (!todo || todo.userId !== req.user.userId) {
    return res.status(404).json({ error: 'Todo not found or not owned by user' });
  }

  Todos.delete(req.params.id);
  res.sendStatus(204);
});

// --- CREATE TABLES (RUN ONCE) ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// --- START SERVER (Vercel-friendly) ---
if (process.env.VERCEL) {
  module.exports = app; // for Vercel serverless
} else {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

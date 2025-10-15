import bcrypt from 'bcryptjs';
import { Users } from '../models.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existing = Users.findByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = Users.create(username, hashedPassword);
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
}

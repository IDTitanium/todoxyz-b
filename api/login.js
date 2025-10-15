import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users } from '../models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}

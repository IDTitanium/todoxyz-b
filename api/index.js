import authMiddleware from '../authMiddleware.js';
import { Todos } from '../models.js';

export default async function handler(req, res) {
  const user = await new Promise((resolve, reject) => {
    authMiddleware({ headers: req.headers }, { sendStatus: (code) => reject(code) }, (err) => {
      if (err) reject(err);
      else resolve(req.user);
    });
  }).catch((code) => {
    res.sendStatus(code);
    return null;
  });

  if (!user) return;

  if (req.method === 'GET') {
    const todos = Todos.findAllByUser(user.userId);
    return res.json(todos);
  }

  if (req.method === 'POST') {
    const { task } = req.body;
    const todo = Todos.create(user.userId, task);
    return res.status(201).json(todo);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

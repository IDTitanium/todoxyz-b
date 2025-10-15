import authMiddleware from '../../authMiddleware.js';
import { Todos } from '../../models.js';

export default async function handler(req, res) {
  const user = await new Promise((resolve, reject) => {
    authMiddleware(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(req.user);
    });
  }).catch((err) => {
    res.status(401).end();
    throw err;
  });

  if (!user) return;

  if (req.method === 'GET') {
    const todos = Todos.findAllByUser(user.userId);
    return res.json(todos);
  }

  if (req.method === 'POST') {
    try {
      const { task } = req.body;
      if (!task) return res.status(400).json({ error: 'Task is required' });

      const todo = Todos.create(user.userId, task);
      return res.status(201).json(todo);
    } catch (e) {
      console.log(e)
      res.status(500).json({ error: 'Server error' });
    }
    
  }

  res.status(405).json({ error: 'Method not allowed' });
}

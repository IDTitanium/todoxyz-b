import authMiddleware from '../../authMiddleware.js';
import { Todos } from '../../models.js';

export default async function handler(req, res) {
  const { id } = req.query;

  const user = await new Promise((resolve) => {
    authMiddleware(
      { headers: req.headers },
      { sendStatus: (code) => res.sendStatus(code) },
      (err) => {
        if (err) res.sendStatus(401);
        else resolve(req.user);
      }
    );
  });

  if (!user) return;

  const todo = Todos.findTodoById(id);
  if (!todo || todo.userId !== user.userId) {
    return res.status(404).json({ error: 'Todo not found or not owned by user' });
  }

  if (req.method === 'PUT') {
    const updated = Todos.toggleComplete(id, req.body);
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    Todos.delete(id);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}

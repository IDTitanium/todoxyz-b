import {db} from './db.js';

export const Users = {
  create(username, password) {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = stmt.run(username, password);
    return { id: result.lastInsertRowid, username };
  },

  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }
};

export const Todos = {
  create(userId, task) {
    const stmt = db.prepare('INSERT INTO todos (user_id, task) VALUES (?, ?)');
    const result = stmt.run(userId, task);
    return { id: result.lastInsertRowid, task, completed: false };
  },

  findAllByUser(userId) {
    return db.prepare('SELECT * FROM todos WHERE user_id = ?').all(userId);
  },

  toggleComplete(todoId, completed) {
    db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(completed ? 1 : 0, todoId);
  },

  delete(todoId) {
    db.prepare('DELETE FROM todos WHERE id = ?').run(todoId);
  }
};

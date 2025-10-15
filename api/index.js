const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, Todo } = require('./database');
const authMiddleware = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-super-secret-key';

// --- Auth Routes ---

// Register a new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists or invalid data' });
    }
});

// Login a user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});


// --- Todo Routes (Protected) ---

// Get all todos for the logged-in user
app.get('/api/todos', authMiddleware, async (req, res) => {
    const todos = await Todo.findAll({ where: { UserId: req.user.userId } });
    res.json(todos);
});

// Create a new todo
app.post('/api/todos', authMiddleware, async (req, res) => {
    const { task } = req.body;
    const newTodo = await Todo.create({ task, UserId: req.user.userId });
    res.status(201).json(newTodo);
});

// Update a todo
app.put('/api/todos/:id', authMiddleware, async (req, res) => {
    const { task, completed } = req.body;
    const todo = await Todo.findOne({ where: { id: req.params.id, UserId: req.user.userId } });

    if (todo) {
        todo.task = task !== undefined ? task : todo.task;
        todo.completed = completed !== undefined ? completed : todo.completed;
        await todo.save();
        res.json(todo);
    } else {
        res.status(404).json({ error: 'Todo not found or not owned by user' });
    }
});

// Delete a todo
app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
    const todo = await Todo.findOne({ where: { id: req.params.id, UserId: req.user.userId } });

    if (todo) {
        await todo.destroy();
        res.sendStatus(204); // No Content
    } else {
        res.status(404).json({ error: 'Todo not found or not owned by user' });
    }
});


// Sync database and start server
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
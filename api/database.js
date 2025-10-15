const { Sequelize, DataTypes } = require('sequelize');

// 1. Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite' // This will create a file named database.sqlite
});

// 2. Define the User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// 3. Define the Todo model
const Todo = sequelize.define('Todo', {
    task: {
        type: DataTypes.STRING,
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// 4. Define the relationship: A User can have many Todos
User.hasMany(Todo);
Todo.belongsTo(User);

// 5. Export the models and sequelize instance
module.exports = { sequelize, User, Todo };
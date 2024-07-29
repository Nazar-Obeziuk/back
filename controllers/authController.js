const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const dbConfig = require('../config/dbConfig');

exports.register = async (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { username, email, password, role } = req.body;
    const userRole = role || 'user';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';

        connection.connect(err => {
            if (err) {
                console.error('Помилка підключення до бази даних: ' + err.stack);
                return res.status(500).json({ error: 'Помилка підключення до бази даних' });
            }

            connection.query(query, [username, email, hashedPassword, userRole], (err, results) => {
                if (err) {
                    console.error('Помилка виконання запиту: ' + err.message);
                    return res.status(500).json({ error: 'Помилка виконання запиту' });
                }
                res.status(201).json({ message: 'Користувача успішно зареєстровано!' });
                connection.end();
            });
        });
    } catch (error) {
        console.error('Помилка хешування паролю: ' + error.message);
        res.status(500).json({ error: 'Помилка хешування паролю' });
    }
};

exports.login = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';

    connection.connect(err => {
        if (err) {
            console.error('Помилка підключення до бази даних: ' + err.stack);
            return res.status(500).json({ error: 'Помилка підключення до бази даних' });
        }

        connection.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Помилка виконання запиту: ' + err.message);
                return res.status(500).json({ error: 'Помилка виконання запиту' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Невірний email або пароль' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Невірний email або пароль' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '30d' });
            res.json({ message: 'Вхід успішний', token });
            connection.end();
        });
    });
};

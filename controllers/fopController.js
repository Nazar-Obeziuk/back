const mysql = require("mysql");
const dbConfig = require("../config/dbConfig");

exports.getFopData = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { lang } = req.params;

    connection.connect((err) => {
        if (err) {
            console.error("Помилка підключення до бази даних: " + err.stack);
            return res.status(500).send("Помилка підключення до бази даних");
        }

        const sqlQuery = "SELECT * FROM fop_data WHERE language = ?";
        connection.query(sqlQuery, [lang], (err, results) => {
            if (err) {
                console.error("Помилка виконання запиту: " + err.message);
                return res.status(500).send("Помилка сервера");
            }
            res.json(results);
            connection.end();
        });
    });
};

exports.createFopData = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const {
        language,
        first_fop_text,
        second_fop_text,
        third_fop_text,
        fourth_fop_text,
        first_date_fop,
        second_date_fop
    } = req.body;

    connection.connect((err) => {
        if (err) {
            console.error("Помилка підключення до бази даних: " + err.stack);
            return res.status(500).send("Помилка підключення до бази даних");
        }

        const sqlQuery = "INSERT INTO fop_data (language, first_fop_text, second_fop_text, third_fop_text, fourth_fop_text, first_date_fop, second_date_fop) VALUES (?, ?, ?, ?, ?, ?, ?)";
        connection.query(
            sqlQuery,
            [language, first_fop_text, second_fop_text, third_fop_text, fourth_fop_text, first_date_fop, second_date_fop],
            (err, results) => {
                if (err) {
                    console.error("Помилка виконання запиту: " + err.message);
                    return res.status(500).send("Помилка сервера");
                }
                res.status(201).json({ message: "Дані успішно додано", id: results.insertId });
                connection.end();
            }
        );
    });
};


exports.updateFopData = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { id } = req.params;
    const { first_fop_text, second_fop_text, third_fop_text, fourth_fop_text, first_date_fop, second_date_fop } = req.body;

    connection.connect((err) => {
        if (err) {
            console.error("Помилка підключення до бази даних: " + err.stack);
            return res.status(500).send("Помилка підключення до бази даних");
        }

        const sqlQuery = "UPDATE fop_data SET first_fop_text = ?, second_fop_text = ?, third_fop_text = ?, fourth_fop_text = ?, first_date_fop = ?, second_date_fop = ? WHERE id = ?";
        connection.query(
            sqlQuery,
            [first_fop_text, second_fop_text, third_fop_text, fourth_fop_text, first_date_fop, second_date_fop, id],
            (err, results) => {
                if (err) {
                    console.error("Помилка виконання запиту: " + err.message);
                    return res.status(500).send("Помилка сервера");
                }
                res.json({ message: "Дані успішно оновлено" });
                connection.end();
            }
        );
    });
};

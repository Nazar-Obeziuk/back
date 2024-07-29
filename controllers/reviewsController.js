const mysql = require("mysql");
const dbConfig = require("../config/dbConfig");

exports.getGeneralReviews = (req, res) => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const sqlQuery = "SELECT * FROM reviews WHERE category = ?";
    connection.query(sqlQuery, ["General"], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        res.status(500).send("Помилка сервера");
      } else {
        res.json(results);
      }
      connection.end();
    });
  });
};

exports.getReviewsByProductId = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { product_id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const sqlQuery =
      "SELECT * FROM reviews WHERE product_id = ? AND category = ?";
    connection.query(sqlQuery, [product_id, "product"], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        res.status(500).send("Помилка сервера");
      } else {
        res.json(results);
      }
      connection.end();
    });
  });
};

exports.getReview = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery = "SELECT * FROM reviews WHERE id = ?";
    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }
      if (results.length === 0) {
        return res.status(404).send("Запис з вказаним ID не знайдено");
      }
      res.json(results[0]);
      connection.end();
    });
  });
};

exports.createGeneralReview = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const {
      stars,
      name_ua,
      name_en,
      description_ua,
      description_en,
      pluses_ua,
      pluses_en,
      minuses_ua,
      minuses_en,
    } = req.body;

    const sqlQuery = `
            INSERT INTO reviews (stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en, category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    connection.query(
      sqlQuery,
      [
        stars,
        name_ua,
        name_en,
        description_ua,
        description_en,
        pluses_ua,
        pluses_en,
        minuses_ua,
        minuses_en,
        "General",
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          res.status(500).send("Помилка сервера");
        } else {
          res.status(201).send({
            id: results.insertId,
            stars,
            name_ua,
            name_en,
            description_ua,
            description_en,
            pluses_ua,
            pluses_en,
            minuses_ua,
            minuses_en,
          });
        }
        connection.end();
      }
    );
  });
};

exports.createProductReview = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { product_id } = req.params;
  const {
    stars,
    name_ua,
    name_en,
    description_ua,
    description_en,
    pluses_ua,
    pluses_en,
    minuses_ua,
    minuses_en,
  } = req.body;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const sqlQuery = `
            INSERT INTO reviews (product_id, stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en, category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    connection.query(
      sqlQuery,
      [
        product_id,
        stars,
        name_ua,
        name_en,
        description_ua,
        description_en,
        pluses_ua,
        pluses_en,
        minuses_ua,
        minuses_en,
        "product",
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          res.status(500).send("Помилка сервера");
        } else {
          res.status(201).send({
            id: results.insertId,
            product_id,
            stars,
            name_ua,
            name_en,
            description_ua,
            description_en,
            pluses_ua,
            pluses_en,
            minuses_ua,
            minuses_en,
          });
        }
        connection.end();
      }
    );
  });
};

exports.getCertificateReviews = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { certificate_id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery =
      "SELECT * FROM reviews WHERE category = ? and certificate_id = ?";
    connection.query(
      sqlQuery,
      ["certificate", certificate_id],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          return res.status(500).send("Помилка сервера");
        } else {
          res.json(results);
        }
        connection.end();
      }
    );
  });
};
exports.createCertificateReview = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { certificate_id } = req.params;

  console.log(certificate_id);
  const {
    stars,
    name_ua,
    name_en,
    description_ua,
    description_en,
    pluses_ua,
    pluses_en,
    minuses_ua,
    minuses_en,
  } = req.body;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).json({ message: "Помилка підключення до бази даних" });
      return;
    }

    const sqlQuery = `
      INSERT INTO reviews (certificate_id, stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      sqlQuery,
      [
        certificate_id,
        stars,
        name_ua,
        name_en,
        description_ua,
        description_en,
        pluses_ua,
        pluses_en,
        minuses_ua,
        minuses_en,
        "certificate",
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          res.status(500).json({ message: "Помилка сервера" });
        } else {
          res.status(201).json({
            message: "Відгук успішно створено",
            review: {
              id: results.insertId,
              certificate_id,
              stars,
              name_ua,
              name_en,
              description_ua,
              description_en,
              pluses_ua,
              pluses_en,
              minuses_ua,
              minuses_en,
            },
          });
        }
        connection.end();
      }
    );
  });
};

exports.getIndividualReviews = (req, res) => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const sqlQuery = "SELECT * FROM reviews WHERE category = ?";
    connection.query(sqlQuery, ["individual"], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        res.status(500).send("Помилка сервера");
      } else {
        res.json(results);
      }
      connection.end();
    });
  });
};

exports.createIndividualReview = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const {
    stars,
    name_ua,
    name_en,
    description_ua,
    description_en,
    pluses_ua,
    pluses_en,
    minuses_ua,
    minuses_en,
  } = req.body;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const sqlQuery = `
            INSERT INTO reviews (stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en, category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    connection.query(
      sqlQuery,
      [
        stars,
        name_ua,
        name_en,
        description_ua,
        description_en,
        pluses_ua,
        pluses_en,
        minuses_ua,
        minuses_en,
        "individual",
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          res.status(500).send("Помилка сервера");
        } else {
          res.status(201).send({
            id: results.insertId,
            stars,
            name_ua,
            name_en,
            description_ua,
            description_en,
            pluses_ua,
            pluses_en,
            minuses_ua,
            minuses_en,
          });
        }
        connection.end();
      }
    );
  });
};

exports.updateReview = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;
  const {
    stars,
    name_ua,
    name_en,
    description_ua,
    description_en,
    pluses_ua,
    pluses_en,
    minuses_ua,
    minuses_en,
  } = req.body;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const sqlQuery = `
            UPDATE reviews 
            SET stars = ?, name_ua = ?, name_en = ?, description_ua = ?, description_en = ?, pluses_ua = ?, pluses_en = ?, minuses_ua = ?, minuses_en = ?
            WHERE id = ?
        `;

    connection.query(
      sqlQuery,
      [
        stars,
        name_ua,
        name_en,
        description_ua,
        description_en,
        pluses_ua,
        pluses_en,
        minuses_ua,
        minuses_en,
        id,
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          res.status(500).send("Помилка сервера");
        } else if (results.affectedRows === 0) {
          res.status(404).send("Запис з вказаним ID не знайдено");
        } else {
          res.status(200).send(`Запис з ID ${id} успішно оновлено`);
        }
        connection.end();
      }
    );
  });
};

exports.deleteReview = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      res.status(500).send("Помилка підключення до бази даних");
      return;
    }

    const sqlQuery = "DELETE FROM reviews WHERE id = ?";
    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        res.status(500).send("Помилка сервера");
      } else if (results.affectedRows === 0) {
        res.status(404).send("Запис з вказаним ID не знайдено");
      } else {
        res.status(200).send(`Запис з ID ${id} успішно видалено`);
      }
      connection.end();
    });
  });
};

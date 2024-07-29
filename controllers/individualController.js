const mysql = require("mysql");
const dbConfig = require("../config/dbConfig");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const os = require("os");
const fs = require("fs");
const bucket = require("../config/firebaseConfig");

async function uploadImagesToFirebase(files) {
  const urls = [];
  for (const file of files) {
    const tempFilePath = path.join(os.tmpdir(), file.originalname);
    fs.writeFileSync(tempFilePath, file.buffer);

    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    const destinationPath = `individual/${uniqueFilename}`;

    await bucket.upload(tempFilePath, {
      destination: destinationPath,
      metadata: {
        contentType: file.mimetype,
      },
    });

    fs.unlinkSync(tempFilePath);

    const fileRef = bucket.file(destinationPath);
    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    urls.push(url);
  }
  return urls;
}

exports.getAllIndividualInsoles = (req, res) => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }
    const sqlQuery = `
            SELECT 
                i.id AS id,
                i.name_en AS name_en,
                i.name_ua AS name_ua,
                i.base_price AS base_price,
                i.image_url AS image_url,
                i.article AS article,
                i.article_variation_ua AS article_variation_ua,
                i.article_variation_en AS article_variation_en,
                i.first_about_description_ua AS first_about_description_ua,
                i.first_about_description_en AS first_about_description_en,
                i.second_about_description_ua AS second_about_description_ua,
                i.second_about_description_en AS second_about_description_en,
                i.third_about_description_ua AS third_about_description_ua,
                i.third_about_description_en AS third_about_description_en,
                i.fourth_about_description_ua AS fourth_about_description_ua,
                i.fourth_about_description_en AS fourth_about_description_en,
                i.characteristics_subtitle_ua AS characteristics_subtitle_ua,
                i.characteristics_subtitle_en AS characteristics_subtitle_en,
                i.characteristics_description_ua AS characteristics_description_ua,
                i.characteristics_description_en AS characteristics_description_en,
                i.characteristics_ua AS characteristics_ua,
                i.characteristics_en AS characteristics_en,
                COALESCE(AVG(r.stars), 0) AS average_rating,
                COUNT(r.id) AS reviews_count
            FROM 
                individual i
            LEFT JOIN
                reviews r ON i.id = r.product_id
            GROUP BY 
                i.id
            ORDER BY 
                i.id;
        `;

    connection.query(sqlQuery, (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }

      results.forEach((individual) => {
        if (individual.image_url) {
          individual.image_url = JSON.parse(individual.image_url);
        } else {
          individual.image_url = [];
        }

        if (individual.characteristics_ua) {
          individual.characteristics_ua = JSON.parse(
            individual.characteristics_ua
          );
        } else {
          individual.characteristics_ua = {};
        }

        if (individual.characteristics_en) {
          individual.characteristics_en = JSON.parse(
            individual.characteristics_en
          );
        } else {
          individual.characteristics_en = {};
        }
      });

      res.json(results);
      connection.end();
    });
  });
};

exports.getIndividualInsole = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery = `
        SELECT 
          i.id AS id,
          i.name_en AS name_en,
          i.name_ua AS name_ua,
          i.base_price AS base_price,
          i.image_url AS image_url,
          i.article AS article,
          i.article_variation_ua AS article_variation_ua,
          i.article_variation_en AS article_variation_en,
          i.first_about_description_ua AS first_about_description_ua,
          i.first_about_description_en AS first_about_description_en,
          i.second_about_description_ua AS second_about_description_ua,
          i.second_about_description_en AS second_about_description_en,
          i.third_about_description_ua AS third_about_description_ua,
          i.third_about_description_en AS third_about_description_en,
          i.fourth_about_description_ua AS fourth_about_description_ua,
          i.fourth_about_description_en AS fourth_about_description_en,
          i.characteristics_subtitle_ua AS characteristics_subtitle_ua,
          i.characteristics_subtitle_en AS characteristics_subtitle_en,
          i.characteristics_description_ua AS characteristics_description_ua,
          i.characteristics_description_en AS characteristics_description_en,
          i.characteristics_ua AS characteristics_ua,
          i.characteristics_en AS characteristics_en,
          COALESCE(AVG(r.stars), 0) AS average_rating,
          COUNT(r.id) AS reviews_count
        FROM 
          individual i
        LEFT JOIN
          reviews r ON i.id = r.product_id
        WHERE 
          i.id = ?
        GROUP BY 
          i.id;
      `;

    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        res.status(500).send("Помилка сервера");
      } else {
        if (results.length === 0) {
          res.status(404).send("Індивідуальної устілки не знайдено");
          connection.end();
          return;
        }

        const individual = {
          id: results[0].id,
          name_en: results[0].name_en,
          name_ua: results[0].name_ua,
          base_price: results[0].base_price,
          image_url: JSON.parse(results[0].image_url || "[]"),
          average_rating: results[0].average_rating,
          reviews_count: results[0].reviews_count,
          article: results[0].article,
          article_variation_ua: results[0].article_variation_ua,
          article_variation_en: results[0].article_variation_en,
          first_about_description_ua: results[0].first_about_description_ua,
          first_about_description_en: results[0].first_about_description_en,
          second_about_description_ua: results[0].second_about_description_ua,
          second_about_description_en: results[0].second_about_description_en,
          third_about_description_ua: results[0].third_about_description_ua,
          third_about_description_en: results[0].third_about_description_en,
          fourth_about_description_ua: results[0].fourth_about_description_ua,
          fourth_about_description_en: results[0].fourth_about_description_en,
          characteristics_subtitle_ua: results[0].characteristics_subtitle_ua,
          characteristics_subtitle_en: results[0].characteristics_subtitle_en,
          characteristics_description_ua:
            results[0].characteristics_description_ua,
          characteristics_description_en:
            results[0].characteristics_description_en,
          characteristics_ua: JSON.parse(results[0].characteristics_ua || "{}"),
          characteristics_en: JSON.parse(results[0].characteristics_en || "{}"),
        };

        res.json(individual);
      }
      connection.end();
    });
  });
};

exports.createIndividualInsole = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const {
    name_ua,
    name_en,
    article,
    base_price,
    article_variation_ua,
    article_variation_en,
    first_about_description_ua,
    first_about_description_en,
    second_about_description_ua,
    second_about_description_en,
    third_about_description_ua,
    third_about_description_en,
    fourth_about_description_ua,
    fourth_about_description_en,
    characteristics_subtitle_ua,
    characteristics_subtitle_en,
    characteristics_description_ua,
    characteristics_description_en,
    characteristics_ua,
    characteristics_en,
  } = req.body;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS individual (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name_ua VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      base_price DECIMAL(10,2) NOT NULL,
      image_url JSON,
      article VARCHAR(255) NOT NULL,
      article_variation_ua VARCHAR(255),
      article_variation_en VARCHAR(255),
      first_about_description_ua TEXT,
      first_about_description_en TEXT,
      second_about_description_ua TEXT,
      second_about_description_en TEXT,
      third_about_description_ua TEXT,
      third_about_description_en TEXT,
      fourth_about_description_ua TEXT,
      fourth_about_description_en TEXT,
      characteristics_subtitle_ua VARCHAR(255),
      characteristics_subtitle_en VARCHAR(255),
      characteristics_description_ua TEXT,
      characteristics_description_en TEXT,
      characteristics_ua JSON,
      characteristics_en JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const validateInput = (data) => {
    if (!data.name_ua || !data.name_en || !data.base_price || !data.article) {
      return false;
    }
    return true;
  };

  if (!validateInput(req.body)) {
    return res.status(400).send("Невірні вхідні дані");
  }

  let imageUrls = [];
  if (req.files) {
    try {
      imageUrls = await uploadImagesToFirebase(req.files);
    } catch (err) {
      console.error("Помилка завантаження зображень: " + err);
      return res.status(500).send("Помилка завантаження зображень");
    }
  }

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error("Помилка створення таблиці: " + err.message);
        return res.status(500).send("Помилка сервера при створенні таблиці");
      }

      const sqlQuery = `
        INSERT INTO individual (
          name_ua, 
          name_en, 
          base_price, 
          image_url, 
          article, 
          article_variation_ua,
          article_variation_en,
          first_about_description_ua,
          first_about_description_en,
          second_about_description_ua,
          second_about_description_en,
          third_about_description_ua,
          third_about_description_en,
          fourth_about_description_ua,
          fourth_about_description_en,
          characteristics_subtitle_ua,
          characteristics_subtitle_en,
          characteristics_description_ua,
          characteristics_description_en,
          characteristics_ua,
          characteristics_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      connection.query(
        sqlQuery,
        [
          name_ua,
          name_en,
          base_price,
          JSON.stringify(imageUrls),
          article,
          article_variation_ua,
          article_variation_en,
          first_about_description_ua,
          first_about_description_en,
          second_about_description_ua,
          second_about_description_en,
          third_about_description_ua,
          third_about_description_en,
          fourth_about_description_ua,
          fourth_about_description_en,
          characteristics_subtitle_ua,
          characteristics_subtitle_en,
          characteristics_description_ua,
          characteristics_description_en,
          characteristics_ua,
          characteristics_en,
        ],
        (err, results) => {
          if (err) {
            console.error("Помилка виконання запиту: " + err.message);
            return res.status(500).send("Помилка сервера");
          }
          res.status(201).json({
            message: "Продукт успішно створено",
            individualId: results.insertId,
          });
          connection.end();
        }
      );
    });
  });
};

exports.updateIndividualInsole = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;
  const {
    name_ua,
    name_en,
    article,
    base_price,
    article_variation_ua,
    article_variation_en,
    first_about_description_ua,
    first_about_description_en,
    second_about_description_ua,
    second_about_description_en,
    third_about_description_ua,
    third_about_description_en,
    fourth_about_description_ua,
    fourth_about_description_en,
    characteristics_subtitle_ua,
    characteristics_subtitle_en,
    characteristics_description_ua,
    characteristics_description_en,
    characteristics_ua,
    characteristics_en,
  } = req.body;

  try {
    connection.connect();

    const getImageQuery = "SELECT image_url FROM individual WHERE id = ?";
    const [results] = await new Promise((resolve, reject) => {
      connection.query(getImageQuery, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    let currentImageUrls;

    if (req.files.length > 0) {
      try {
        currentImageUrls = await uploadImagesToFirebase(req.files);
      } catch (err) {
        console.error("Помилка завантаження зображень слайдера:", err);
        return res.status(500).send("Помилка завантаження зображень слайдера");
      }
    }

    const sqlQuery = `
        UPDATE individual SET 
        name_ua = ?,
        name_en = ?,
        article = ?,
        base_price = ?,
        article_variation_ua = ?,
        article_variation_en = ?,
        first_about_description_ua = ?,
        first_about_description_en = ?,
        second_about_description_ua = ?,
        second_about_description_en = ?,
        third_about_description_ua = ?,
        third_about_description_en = ?,
        fourth_about_description_ua = ?,
        fourth_about_description_en = ?,
        characteristics_subtitle_ua = ?,
        characteristics_subtitle_en = ?,
        characteristics_description_ua = ?,
        characteristics_description_en = ?,
        characteristics_ua = ?,
        characteristics_en = ?,
        image_url = IFNULL(?, image_url)
        WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      connection.query(
        sqlQuery,
        [
          name_ua,
          name_en,
          article,
          base_price,
          article_variation_ua,
          article_variation_en,
          first_about_description_ua,
          first_about_description_en,
          second_about_description_ua,
          second_about_description_en,
          third_about_description_ua,
          third_about_description_en,
          fourth_about_description_ua,
          fourth_about_description_en,
          characteristics_subtitle_ua,
          characteristics_subtitle_en,
          characteristics_description_ua,
          characteristics_description_en,
          characteristics_ua,
          characteristics_en,
          JSON.stringify(currentImageUrls) || null,
          id,
        ],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    res.json({ message: "Продукт успішно оновлено" });
  } catch (err) {
    console.error("Помилка оновлення продукту: " + err);
    res.status(500).send("Помилка сервера");
  } finally {
    connection.end();
  }
};

exports.deleteIndividualInsole = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const getImageQuery = "SELECT image_url FROM individual WHERE id = ?";
    connection.query(getImageQuery, [id], async (err, results) => {
      if (err) {
        console.error("Помилка отримання поточних зображень: " + err.message);
        connection.end();
        return res.status(500).send("Помилка сервера");
      }

      let currentImageUrls = [];
      if (results.length > 0 && results[0].image_url) {
        currentImageUrls = JSON.parse(results[0].image_url);
      }

      const deleteIndividualQuery = "DELETE FROM individual WHERE id = ?";
      connection.query(deleteIndividualQuery, [id], async (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          return res.status(500).send("Помилка сервера");
        }

        try {
          for (const url of currentImageUrls) {
            const fileName = url.split("/").pop();
            await bucket.file(`individual/${fileName}`).delete();
          }
        } catch (err) {
          console.error("Помилка видалення зображень з Firebase: " + err);
          return res.status(500).send("Помилка видалення зображень");
        }

        res.json({ message: "Індивідуальна устілка успішно видалена" });
        connection.end();
      });
    });
  });
};

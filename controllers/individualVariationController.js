const mysql = require("mysql");
const dbConfig = require("../config/dbConfig");
const bucket = require("../config/firebaseConfig");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const os = require("os");
const fs = require("fs");

async function uploadImageToFirebase(file) {
  const tempFilePath = path.join(os.tmpdir(), file.originalname);
  fs.writeFileSync(tempFilePath, file.buffer);

  const uniqueFilename = `${uuidv4()}-${file.originalname}`;
  await bucket.upload(tempFilePath, {
    destination: `individual-variations/${uniqueFilename}`,
    metadata: {
      contentType: file.mimetype,
    },
  });

  fs.unlinkSync(tempFilePath);

  const fileRef = bucket.file(`individual-variations/${uniqueFilename}`);
  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/individual-variations/${uniqueFilename}`;
  return url;
}
async function uploadIndividualImages(files) {
  const urls = [];
  for (const file of files) {
    const url = await uploadImageToFirebase(file);
    urls.push(url);
  }
  return urls;
}

exports.getAllVariations = (req, res) => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const { individualId } = req.params;

    const sqlQuery = `
              SELECT 
                  iv.id AS id,
                  iv.individual_id AS individual_id,
                  iv.variation_type AS variation_type,
                  iv.variation_value AS variation_value,
                  iv.additional_price AS additional_price,
                  iv.image AS image,
                  iv.image_url AS image_url,
                  iv.article AS article,
                  iv.category AS category,
                  iv.variation_description_ua AS variation_description_ua,
                  iv.variation_description_en AS variation_description_en,
                  iv.first_about_description_ua AS first_about_description_ua,
                  iv.first_about_description_ua AS first_about_description_en,
                  iv.second_about_description_ua AS second_about_description_ua,
                  iv.second_about_description_en AS second_about_description_en,
                  iv.third_about_description_ua AS third_about_description_ua,
                  iv.third_about_description_en AS third_about_description_en,
                  iv.fourth_about_description_ua AS fourth_about_description_ua,
                  iv.fourth_about_description_en AS fourth_about_description_en,
                  iv.characteristics_subtitle_ua AS characteristics_subtitle_ua,
                  iv.characteristics_subtitle_en AS characteristics_subtitle_en,
                  iv.characteristics_description_ua AS characteristics_description_ua,
                  iv.characteristics_description_en AS characteristics_description_en,
                  iv.characteristics_ua AS characteristics_ua,
                  iv.characteristics_en AS characteristics_en
              FROM 
              individualVariations iv
              WHERE individual_id = ?
          `;

    connection.query(sqlQuery, [individualId], (err, results) => {
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

exports.getVariation = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery = "SELECT * FROM individualVariations WHERE id = ?";
    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }

      if (results.length > 0) {
        const individualInsoles = results[0];

        if (
          individualInsoles.image_url ||
          individualInsoles.characteristics_ua ||
          individualInsoles.characteristics_en
        ) {
          individualInsoles.image_url = JSON.parse(individualInsoles.image_url);
          individualInsoles.characteristics_ua = JSON.parse(
            individualInsoles.characteristics_ua
          );
          individualInsoles.characteristics_en = JSON.parse(
            individualInsoles.characteristics_en
          );
        } else {
          individualInsoles.image_url = "[]";
          individualInsoles.characteristics_ua = "{}";
          individualInsoles.characteristics_en = "{}";
        }

        res.json(individualInsoles);
      } else {
        res.status(404).send("Варіацію не знайдено");
      }

      connection.end();
    });
  });
};

exports.createVariation = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { individualId } = req.params;
  const {
    variation_type,
    variation_value,
    additional_price,
    article,
    category,
    variation_description_en,
    variation_description_ua,
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

  let imageUrl = "";
  let individualImages = [];
  if (req.files && req.files.image) {
    try {
      imageUrl = await uploadImageToFirebase(req.files.image[0]);
    } catch (err) {
      console.error("Помилка завантаження зображення:", err);
      return res.status(500).send("Помилка завантаження зображення");
    }
  }

  if (req.files && req.files.image_url) {
    try {
      individualImages = await uploadIndividualImages(req.files.image_url);
    } catch (err) {
      console.error(
        "Помилка завантаження зображень індивідуальних устілок:",
        err
      );
      return res.status(500).send("Помилка завантаження зображень слайдера");
    }
  }

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database: " + err.stack);
      return res.status(500).send("Database connection error");
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS individualVariations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        individual_id INT,
        variation_type VARCHAR(255),
        variation_value VARCHAR(255),
        additional_price DECIMAL(10, 2),
        image VARCHAR(255),
        image_url JSON,
        article VARCHAR(255),
        category VARCHAR(255),
        variation_description_en TEXT,
        variation_description_ua TEXT,
        first_about_description_ua TEXT,
        first_about_description_en TEXT,
        second_about_description_ua TEXT,
        second_about_description_en TEXT,
        third_about_description_ua TEXT,
        third_about_description_en TEXT,
        fourth_about_description_ua TEXT,
        fourth_about_description_en TEXT,
        characteristics_subtitle_ua TEXT,
        characteristics_subtitle_en TEXT,
        characteristics_description_ua TEXT,
        characteristics_description_en TEXT,
        characteristics_ua JSON,
        characteristics_en JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating table: " + err.message);
        return res.status(500).send("Server error");
      }

      const sqlQuery = `INSERT INTO individualVariations (
          individual_id,
          variation_type,
          variation_value,
          additional_price,
          article,
          category,
          variation_description_en,
          variation_description_ua,
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
          image,
          image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      connection.query(
        sqlQuery,
        [
          individualId,
          variation_type,
          variation_value,
          additional_price,
          article,
          category,
          variation_description_en,
          variation_description_ua,
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
          imageUrl,
          JSON.stringify(individualImages),
        ],
        (err, results) => {
          if (err) {
            console.error("Помилка при запиті на сервер:", err.message);
            return res.status(500).send("Помилка сервера");
          }
          res.status(201).json({
            message: "Варіацію успішно створено",
            variationId: results.insertId,
          });
          connection.end();
        }
      );
    });
  });
};

exports.updateVariation = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;
  const {
    variation_type,
    variation_value,
    additional_price,
    article,
    category,
    variation_description_en,
    variation_description_ua,
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

  let imageUrl = "";
  let individualImages;

  if (req.files && req.files.image) {
    try {
      imageUrl = await uploadImageToFirebase(req.files.image[0]);
    } catch (err) {
      console.error("Помилка завантаження зображення:", err);
      return res.status(500).send("Помилка завантаження зображення");
    }
  }

  if (req.files && req.files.image_url) {
    try {
      individualImages = await uploadIndividualImages(req.files.image_url);
    } catch (err) {
      console.error(
        "Помилка завантаження зображень індивідуальних устілок:",
        err
      );
      return res.status(500).send("Помилка завантаження зображень варіації");
    }
  }

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery = `UPDATE individualVariations SET
        variation_type = ?,
        variation_value = ?,
        additional_price = ?,
        article = ?,
        category = ?,
        variation_description_en = ?,
        variation_description_ua = ?,
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
        image = IFNULL(?, image),
        image_url = IFNULL(?, image_url)
        WHERE id = ?`;
    connection.query(
      sqlQuery,
      [
        variation_type,
        variation_value,
        additional_price,
        article,
        category,
        variation_description_en,
        variation_description_ua,
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
        imageUrl || null,
        JSON.stringify(individualImages) || null,
        id,
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          return res.status(500).send("Помилка сервера");
        }
        res.json({ message: "Варіацію успішно оновлено" });
        connection.end();
      }
    );
  });
};

exports.deleteVariation = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery = "DELETE FROM individualVariations WHERE id = ?";
    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }
      res.json({ message: "Варіацію успішно видалено" });
      connection.end();
    });
  });
};

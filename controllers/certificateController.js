const mysql = require("mysql");
const dbConfig = require("../config/dbConfig");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const os = require("os");
const fs = require("fs");
const bucket = require("../config/firebaseConfig");

async function uploadImageToFirebase(file) {
  const tempFilePath = path.join(os.tmpdir(), file.originalname);
  fs.writeFileSync(tempFilePath, file.buffer);

  const uniqueFilename = `${uuidv4()}-${file.originalname}`;
  await bucket.upload(tempFilePath, {
    destination: `certificates/${uniqueFilename}`,
    metadata: {
      contentType: file.mimetype,
    },
  });

  fs.unlinkSync(tempFilePath);

  const fileRef = bucket.file(`certificates/${uniqueFilename}`);
  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/certificates/${uniqueFilename}`;
  return url;
}

async function uploadSliderImages(files) {
  const urls = [];
  for (const file of files) {
    const url = await uploadImageToFirebase(file);
    urls.push(url);
  }
  return urls;
}

exports.getAllCertificates = (req, res) => {
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
                i.description_ua AS description_ua,
                i.description_en AS description_en,
                i.first_about_description_ua AS first_about_description_ua,
                i.first_about_description_en AS first_about_description_en,
                i.second_about_description_ua AS second_about_description_ua,
                i.second_about_description_en AS second_about_description_en,
                i.third_about_description_ua AS third_about_description_ua,
                i.third_about_description_en AS third_about_description_en,
                i.first_use_description_ua AS first_use_description_ua,
                i.first_use_description_en AS first_use_description_en,
                i.second_use_description_ua AS second_use_description_ua,
                i.second_use_description_en AS second_use_description_en,
                i.third_use_description_ua AS third_use_description_ua,
                i.third_use_description_en AS third_use_description_en,
                i.fourth_use_description_ua AS fourth_use_description_ua,
                i.fourth_use_description_en AS fourth_use_description_en,
                i.fifth_use_description_ua AS fifth_use_description_ua,
                i.fifth_use_description_en AS fifth_use_description_en,
                i.sixth_use_description_ua AS sixth_use_description_ua,
                i.sixth_use_description_en AS sixth_use_description_en,
                i.seventh_use_description_ua AS seventh_use_description_ua,
                i.seventh_use_description_en AS seventh_use_description_en,
                i.eighth_use_description_ua AS eighth_use_description_ua,
                i.eighth_use_description_en AS eighth_use_description_en,
                i.nineth_use_description_ua AS nineth_use_description_ua,
                i.nineth_use_description_en AS nineth_use_description_en,
                COALESCE(AVG(r.stars), 0) AS average_rating,
                COUNT(r.id) AS reviews_count
            FROM 
                certificate i
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
      });

      res.json(results);
      connection.end();
    });
  });
};

exports.getCertificate = (req, res) => {
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
          i.description_ua AS description_ua,
          i.description_en AS description_en,
          i.first_about_description_ua AS first_about_description_ua,
          i.first_about_description_en AS first_about_description_en,
          i.second_about_description_ua AS second_about_description_ua,
          i.second_about_description_en AS second_about_description_en,
          i.third_about_description_ua AS third_about_description_ua,
          i.third_about_description_en AS third_about_description_en,
          i.first_use_description_ua AS first_use_description_ua,
          i.first_use_description_en AS first_use_description_en,
          i.second_use_description_ua AS second_use_description_ua,
          i.second_use_description_en AS second_use_description_en,
          i.third_use_description_ua AS third_use_description_ua,
          i.third_use_description_en AS third_use_description_en,
          i.fourth_use_description_ua AS fourth_use_description_ua,
          i.fourth_use_description_en AS fourth_use_description_en,
          i.fifth_use_description_ua AS fifth_use_description_ua,
          i.fifth_use_description_en AS fifth_use_description_en,
          i.sixth_use_description_ua AS sixth_use_description_ua,
          i.sixth_use_description_en AS sixth_use_description_en,
          i.seventh_use_description_ua AS seventh_use_description_ua,
          i.seventh_use_description_en AS seventh_use_description_en,
          i.eighth_use_description_ua AS eighth_use_description_ua,
          i.eighth_use_description_en AS eighth_use_description_en,
          i.nineth_use_description_ua AS nineth_use_description_ua,
          i.nineth_use_description_en AS nineth_use_description_en,
          COALESCE(AVG(r.stars), 0) AS average_rating,
          COUNT(r.id) AS reviews_count
        FROM 
          certificate i
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

        const certificate = {
          id: results[0].id,
          name_en: results[0].name_en,
          name_ua: results[0].name_ua,
          description_ua: results[0].description_ua,
          description_en: results[0].description_en,
          base_price: results[0].base_price,
          image_url: JSON.parse(results[0].image_url || "[]"),
          average_rating: results[0].average_rating,
          reviews_count: results[0].reviews_count,
          article: results[0].article,
          first_about_description_ua: results[0].first_about_description_ua,
          first_about_description_en: results[0].first_about_description_en,
          second_about_description_ua: results[0].second_about_description_ua,
          second_about_description_en: results[0].second_about_description_en,
          third_about_description_ua: results[0].third_about_description_ua,
          third_about_description_en: results[0].third_about_description_en,
          first_use_description_ua: results[0].first_use_description_ua,
          first_use_description_en: results[0].first_use_description_en,
          second_use_description_ua: results[0].second_use_description_ua,
          second_use_description_en: results[0].second_use_description_en,
          third_use_description_ua: results[0].third_use_description_ua,
          third_use_description_en: results[0].third_use_description_en,
          fourth_use_description_ua: results[0].fourth_use_description_ua,
          fourth_use_description_en: results[0].fourth_use_description_en,
          fifth_use_description_ua: results[0].fifth_use_description_ua,
          fifth_use_description_en: results[0].fifth_use_description_en,
          sixth_use_description_ua: results[0].sixth_use_description_ua,
          sixth_use_description_en: results[0].sixth_use_description_en,
          seventh_use_description_ua: results[0].seventh_use_description_ua,
          seventh_use_description_en: results[0].seventh_use_description_en,
          eighth_use_description_ua: results[0].eighth_use_description_ua,
          eighth_use_description_en: results[0].eighth_use_description_en,
          nineth_use_description_ua: results[0].nineth_use_description_ua,
          nineth_use_description_en: results[0].nineth_use_description_en,
        };

        res.json(certificate);
      }
      connection.end();
    });
  });
};

exports.createCertificate = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const {
    name_ua,
    name_en,
    article,
    base_price,
    description_ua,
    description_en,
    first_about_description_ua,
    first_about_description_en,
    second_about_description_ua,
    second_about_description_en,
    third_about_description_ua,
    third_about_description_en,
    first_use_description_ua,
    first_use_description_en,
    second_use_description_ua,
    second_use_description_en,
    third_use_description_ua,
    third_use_description_en,
    fourth_use_description_ua,
    fourth_use_description_en,
    fifth_use_description_ua,
    fifth_use_description_en,
    sixth_use_description_ua,
    sixth_use_description_en,
    seventh_use_description_ua,
    seventh_use_description_en,
    eighth_use_description_ua,
    eighth_use_description_en,
    nineth_use_description_ua,
    nineth_use_description_en,
  } = req.body;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS certificate (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name_ua VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      base_price DECIMAL(10,2) NOT NULL,
      image_url JSON,
      article VARCHAR(255) NOT NULL,
      description_ua TEXT,
      description_en TEXT,
      first_about_description_ua TEXT,
      first_about_description_en TEXT,
      second_about_description_ua TEXT,
      second_about_description_en TEXT,
      third_about_description_ua TEXT,
      third_about_description_en TEXT,
      first_use_description_ua TEXT,
      first_use_description_en TEXT,
      second_use_description_ua TEXT,
      second_use_description_en TEXT,
      third_use_description_ua TEXT,
      third_use_description_en TEXT,
      fourth_use_description_ua TEXT,
      fourth_use_description_en TEXT,
      fifth_use_description_ua TEXT,
      fifth_use_description_en TEXT,
      sixth_use_description_ua TEXT,
      sixth_use_description_en TEXT,
      seventh_use_description_ua TEXT,
      seventh_use_description_en TEXT,
      eighth_use_description_ua TEXT,
      eighth_use_description_en TEXT,
      nineth_use_description_ua TEXT,
      nineth_use_description_en TEXT,
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

  let imageUrls;
  if (req.files) {
    try {
      imageUrls = await uploadSliderImages(req.files);
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
        INSERT INTO certificate (
            name_ua,
            name_en,
            base_price,
            image_url,
            article,
            description_ua,
            description_en,
            first_about_description_ua,
            first_about_description_en,
            second_about_description_ua,
            second_about_description_en,
            third_about_description_ua,
            third_about_description_en,
            first_use_description_ua,
            first_use_description_en,
            second_use_description_ua,
            second_use_description_en,
            third_use_description_ua,
            third_use_description_en,
            fourth_use_description_ua,
            fourth_use_description_en,
            fifth_use_description_ua,
            fifth_use_description_en,
            sixth_use_description_ua,
            sixth_use_description_en,
            seventh_use_description_ua,
            seventh_use_description_en,
            eighth_use_description_ua,
            eighth_use_description_en,
            nineth_use_description_ua,
            nineth_use_description_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      connection.query(
        sqlQuery,
        [
          name_ua,
          name_en,
          base_price,
          JSON.stringify(imageUrls),
          article,
          description_ua,
          description_en,
          first_about_description_ua,
          first_about_description_en,
          second_about_description_ua,
          second_about_description_en,
          third_about_description_ua,
          third_about_description_en,
          first_use_description_ua,
          first_use_description_en,
          second_use_description_ua,
          second_use_description_en,
          third_use_description_ua,
          third_use_description_en,
          fourth_use_description_ua,
          fourth_use_description_en,
          fifth_use_description_ua,
          fifth_use_description_en,
          sixth_use_description_ua,
          sixth_use_description_en,
          seventh_use_description_ua,
          seventh_use_description_en,
          eighth_use_description_ua,
          eighth_use_description_en,
          nineth_use_description_ua,
          nineth_use_description_en,
        ],
        (err, results) => {
          if (err) {
            console.error("Помилка виконання запиту: " + err.message);
            return res.status(500).send("Помилка сервера");
          }
          res.status(201).json({
            message: "Сертифікат успішно створено",
            certificateId: results.insertId,
          });
          connection.end();
        }
      );
    });
  });
};

exports.updateCertificate = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;
  const {
    name_ua,
    name_en,
    article,
    base_price,
    description_ua,
    description_en,
    first_about_description_ua,
    first_about_description_en,
    second_about_description_ua,
    second_about_description_en,
    third_about_description_ua,
    third_about_description_en,
    first_use_description_ua,
    first_use_description_en,
    second_use_description_ua,
    second_use_description_en,
    third_use_description_ua,
    third_use_description_en,
    fourth_use_description_ua,
    fourth_use_description_en,
    fifth_use_description_ua,
    fifth_use_description_en,
    sixth_use_description_ua,
    sixth_use_description_en,
    seventh_use_description_ua,
    seventh_use_description_en,
    eighth_use_description_ua,
    eighth_use_description_en,
    nineth_use_description_ua,
    nineth_use_description_en,
  } = req.body;

  let imageUrls;

  if (req.files && req.files.length > 0) {
    console.log("sss");
    try {
      imageUrls = await uploadSliderImages(req.files);
      imageUrls = JSON.stringify(imageUrls);
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

    const sqlQuery = `
      UPDATE certificate SET 
        name_ua = ?, 
        name_en = ?, 
        base_price = ?, 
        image_url = IFNULL(?, image_url),
        article = ?, 
        description_ua = ?, 
        description_en = ?, 
        first_about_description_ua = ?, 
        first_about_description_en = ?, 
        second_about_description_ua = ?, 
        second_about_description_en = ?, 
        third_about_description_ua = ?, 
        third_about_description_en = ?, 
        first_use_description_ua = ?, 
        first_use_description_en = ?, 
        second_use_description_ua = ?, 
        second_use_description_en = ?, 
        third_use_description_ua = ?, 
        third_use_description_en = ?, 
        fourth_use_description_ua = ?, 
        fourth_use_description_en = ?, 
        fifth_use_description_ua = ?, 
        fifth_use_description_en = ?, 
        sixth_use_description_ua = ?, 
        sixth_use_description_en = ?, 
        seventh_use_description_ua = ?, 
        seventh_use_description_en = ?, 
        eighth_use_description_ua = ?, 
        eighth_use_description_en = ?, 
        nineth_use_description_ua = ?, 
        nineth_use_description_en = ?
      WHERE id = ?`;

    connection.query(
      sqlQuery,
      [
        name_ua,
        name_en,
        base_price,
        imageUrls || null,
        article,
        description_ua,
        description_en,
        first_about_description_ua,
        first_about_description_en,
        second_about_description_ua,
        second_about_description_en,
        third_about_description_ua,
        third_about_description_en,
        first_use_description_ua,
        first_use_description_en,
        second_use_description_ua,
        second_use_description_en,
        third_use_description_ua,
        third_use_description_en,
        fourth_use_description_ua,
        fourth_use_description_en,
        fifth_use_description_ua,
        fifth_use_description_en,
        sixth_use_description_ua,
        sixth_use_description_en,
        seventh_use_description_ua,
        seventh_use_description_en,
        eighth_use_description_ua,
        eighth_use_description_en,
        nineth_use_description_ua,
        nineth_use_description_en,
        id,
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          return res.status(500).send("Помилка сервера");
        }
        res.json({ message: "Сертифікат успішно оновлено" });
        connection.end();
      }
    );
  });
};

exports.deleteCertificate = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const getImageQuery = "SELECT image_url FROM certificate WHERE id = ?";
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

      const deleteReviewsQuery = "DELETE FROM reviews WHERE product_id = ?";
      connection.query(deleteReviewsQuery, [id], (err, results) => {
        if (err) {
          console.error("Помилка видалення відгуків: " + err.message);
          return res.status(500).send("Помилка сервера");
        }

        const deleteProductQuery = "DELETE FROM certificate WHERE id = ?";
        connection.query(deleteProductQuery, [id], async (err, results) => {
          if (err) {
            console.error("Помилка виконання запиту: " + err.message);
            return res.status(500).send("Помилка сервера");
          }

          try {
            for (const url of currentImageUrls) {
              const fileName = url.split("/").pop();
              await bucket.file(`certificates/${fileName}`).delete();
            }
          } catch (err) {
            console.error("Помилка видалення зображень з Firebase: " + err);
            return res.status(500).send("Помилка видалення зображень");
          }

          res.json({ message: "Продукт успішно видалено" });
          connection.end();
        });
      });
    });
  });
};

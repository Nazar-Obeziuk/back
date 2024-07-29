const mysql = require("mysql");
const dbConfig = require("../config/dbConfig");
const bucket = require("../config/firebaseConfig");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const os = require("os");
const fs = require("fs");

async function uploadImagesToFirebase(files) {
  const uploadedUrls = [];
  for (const file of files) {
    const tempFilePath = path.join(os.tmpdir(), file.originalname);
    fs.writeFileSync(tempFilePath, file.buffer);

    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    await bucket.upload(tempFilePath, {
      destination: `variations/${uniqueFilename}`,
      metadata: {
        contentType: file.mimetype,
      },
    });

    fs.unlinkSync(tempFilePath);

    const fileRef = bucket.file(`variations/${uniqueFilename}`);
    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/variations/${uniqueFilename}`;
    uploadedUrls.push(url);
  }
  return uploadedUrls;
}

exports.getVariations = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { productId } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery = "SELECT * FROM productVariations WHERE product_id = ?";
    connection.query(sqlQuery, [productId], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }

      results.forEach((product) => {
        if (product.image_url) {
          let urls = product.image_url;
          product.image_url = JSON.parse(urls);
        } else {
          product.image_url = "[]";
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

    const sqlQuery = "SELECT * FROM productVariations WHERE id = ?";
    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }

      if (results.length > 0) {
        const product = results[0];
        if (product.image_url) {
          product.image_url = JSON.parse(product.image_url);
        } else {
          product.image_url = "[]";
        }
        res.json(product);
      } else {
        res.status(404).send("Варіацію не знайдено");
      }

      connection.end();
    });
  });
};

exports.createVariation = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { productId } = req.params;
  const {
    variation_type,
    variation_value,
    additional_price,
    article,
    description_en,
    description_ua,
  } = req.body;

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    try {
      imageUrls = await uploadImagesToFirebase(req.files);
    } catch (err) {
      console.error("Помилка завантаження зображень:", err);
      return res.status(500).send("Помилка завантаження зображень");
    }
  }

  const imageUrlJson = JSON.stringify(imageUrls);

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery =
      "INSERT INTO productVariations (product_id, variation_type, variation_value, additional_price, image_url, article, description_en, description_ua) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      sqlQuery,
      [
        productId,
        variation_type,
        variation_value,
        additional_price,
        imageUrlJson,
        article,
        description_en,
        description_ua,
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          return res.status(500).send("Помилка сервера");
        }
        res
          .status(201)
          .json({
            message: "Варіацію успішно створено",
            variationId: results.insertId,
          });
        connection.end();
      }
    );
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
    description_en,
    description_ua,
  } = req.body;

  let imageUrls = null;
  if (req.files && req.files.length > 0) {
    try {
      imageUrls = await uploadImagesToFirebase(req.files);
    } catch (err) {
      console.error("Помилка завантаження зображень:", err);
      return res.status(500).send("Помилка завантаження зображень");
    }
  }

  const imageUrlJson = imageUrls ? JSON.stringify(imageUrls) : null;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery =
      "UPDATE productVariations SET variation_type = ?, variation_value = ?, additional_price = ?, image_url = IFNULL(?, image_url), article = ?, description_en = ?, description_ua = ? WHERE id = ?";
    connection.query(
      sqlQuery,
      [
        variation_type,
        variation_value,
        additional_price,
        imageUrlJson,
        article,
        description_en,
        description_ua,
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

    const sqlQuery = "DELETE FROM productVariations WHERE id = ?";
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

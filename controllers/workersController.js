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
    destination: `workers/${uniqueFilename}`,
    metadata: {
      contentType: file.mimetype,
    },
  });

  fs.unlinkSync(tempFilePath);

  const fileRef = bucket.file(`workers/${uniqueFilename}`);
  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/workers/${uniqueFilename}`;
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

exports.getWorkers = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }
    const sqlQuery = "SELECT * FROM workers";
    connection.query(sqlQuery, (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }

      results.forEach((worker) => {
        worker.slider_images = JSON.parse(worker.slider_images);
      });

      res.json(results);
      connection.end();
    });
  });
};

exports.getWorker = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;
  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }
    const sqlQuery = "SELECT * FROM workers WHERE id = ?";
    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }
      if (results.length === 0) {
        return res.status(404).send("Працівника не знайдено");
      }

      results.forEach((worker) => {
        worker.slider_images = JSON.parse(worker.slider_images);
      });

      res.json(results[0]);
      connection.end();
    });
  });
};

exports.createWorker = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const {
    name_ua,
    name_en,
    subtitle_ua,
    subtitle_en,
    first_description_ua,
    first_description_en,
    second_description_ua,
    second_description_en,
    third_description_ua,
    third_description_en,
  } = req.body;

  let imageUrl = "";
  let sliderImages = [];
  if (req.files && req.files.image) {
    try {
      imageUrl = await uploadImageToFirebase(req.files.image[0]);
    } catch (err) {
      console.error("Помилка завантаження зображення:", err);
      return res.status(500).send("Помилка завантаження зображення");
    }
  }
  if (req.files && req.files.slider_images) {
    try {
      sliderImages = await uploadSliderImages(req.files.slider_images);
    } catch (err) {
      console.error("Помилка завантаження зображень слайдера:", err);
      return res.status(500).send("Помилка завантаження зображень слайдера");
    }
  }

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery =
      "INSERT INTO workers (name_ua, name_en, subtitle_ua, subtitle_en, first_description_ua, first_description_en, second_description_ua, second_description_en, third_description_ua, third_description_en, image_url, slider_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      sqlQuery,
      [
        name_ua,
        name_en,
        subtitle_ua,
        subtitle_en,
        first_description_ua,
        first_description_en,
        second_description_ua,
        second_description_en,
        third_description_ua,
        third_description_en,
        imageUrl,
        JSON.stringify(sliderImages),
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          return res.status(500).send("Помилка сервера");
        }
        res.status(201).json({
          message: "Працівника успішно створено",
          workerId: results.insertId,
        });
        connection.end();
      }
    );
  });
};

exports.updateWorker = async (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;
  const {
    name_ua,
    name_en,
    subtitle_ua,
    subtitle_en,
    first_description_ua,
    first_description_en,
    second_description_ua,
    second_description_en,
    third_description_ua,
    third_description_en,
  } = req.body;

  let imageUrl = "";
  let sliderImages;

  if (req.files && req.files.image) {
    try {
      imageUrl = await uploadImageToFirebase(req.files.image[0]);
    } catch (err) {
      console.error("Помилка завантаження зображення:", err);
      return res.status(500).send("Помилка завантаження зображення");
    }
  }

  if (
    req.files &&
    req.files.slider_images &&
    req.files.slider_images.length > 0
  ) {
    try {
      sliderImages = await uploadSliderImages(req.files.slider_images);
    } catch (err) {
      console.error("Помилка завантаження зображень слайдера:", err);
      return res.status(500).send("Помилка завантаження зображень слайдера");
    }
  }

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery =
      "UPDATE workers SET name_ua = ?, name_en = ?, subtitle_ua = ?, subtitle_en = ?, first_description_ua = ?, first_description_en = ?, second_description_ua = ?, second_description_en = ?, third_description_ua = ?, third_description_en = ?, image_url = IFNULL(?, image_url), slider_images = IFNULL(?, slider_images) WHERE id = ?";
    connection.query(
      sqlQuery,
      [
        name_ua,
        name_en,
        subtitle_ua,
        subtitle_en,
        first_description_ua,
        first_description_en,
        second_description_ua,
        second_description_en,
        third_description_ua,
        third_description_en,
        imageUrl || null,
        JSON.stringify(sliderImages) || null,
        id,
      ],
      (err, results) => {
        if (err) {
          console.error("Помилка виконання запиту: " + err.message);
          return res.status(500).send("Помилка сервера");
        }
        res.json({ message: "Дані працівника успішно оновлено" });
        connection.end();
      }
    );
  });
};

exports.deleteWorker = (req, res) => {
  const connection = mysql.createConnection(dbConfig);
  const { id } = req.params;

  connection.connect((err) => {
    if (err) {
      console.error("Помилка підключення до бази даних: " + err.stack);
      return res.status(500).send("Помилка підключення до бази даних");
    }

    const sqlQuery = "DELETE FROM workers WHERE id = ?";
    connection.query(sqlQuery, [id], (err, results) => {
      if (err) {
        console.error("Помилка виконання запиту: " + err.message);
        return res.status(500).send("Помилка сервера");
      }
      res.json({ message: "Працівника успішно видалено" });
      connection.end();
    });
  });
};

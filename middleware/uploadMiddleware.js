const multer = require('multer');

// Налаштування сховища
const storage = multer.memoryStorage(); // Зберігаємо файли в пам'яті до завантаження в Firebase

const upload = multer({ storage: storage });

module.exports = upload;

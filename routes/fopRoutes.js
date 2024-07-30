const express = require('express');
const router = express.Router();
const fopController = require('../controllers/fopController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Отримати всі дані для заданої мови
router.get('/:lang', fopController.getFopData);

// Додати нові дані для мови (захищений маршрут)
router.post(
    '/',
    authenticateToken,
    authorizeAdmin,
    upload.none(),
    fopController.createFopData
);

// Оновити дані для мови (захищений маршрут)
router.put(
    '/:id',
    authenticateToken,
    authorizeAdmin,
    upload.none(),
    fopController.updateFopData
);

module.exports = router;

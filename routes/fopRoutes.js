const express = require('express');
const router = express.Router();
const fopController = require('../controllers/fopController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/:lang', fopController.getFopData);
router.get('/one/:id', fopController.getOneFopData); // Маршрут для отримання одного запису

router.post(
    '/',
    authenticateToken,
    authorizeAdmin,
    upload.none(),
    fopController.createFopData
);

router.put(
    '/:id',
    authenticateToken,
    authorizeAdmin,
    upload.none(),
    fopController.updateFopData
);

router.delete(
    '/:id',
    authenticateToken,
    authorizeAdmin,
    fopController.deleteFopData
); // Маршрут для видалення запису

module.exports = router;

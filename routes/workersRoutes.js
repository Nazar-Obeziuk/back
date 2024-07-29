const express = require('express');
const router = express.Router();
const workersController = require('../controllers/workersController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Публічні маршрути
router.get('/', workersController.getWorkers);
router.get('/:id', workersController.getWorker);

// Захищені маршрути для адміністратора
router.post('/', authenticateToken, authorizeAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'slider_images', maxCount: 10 }
]), workersController.createWorker);

router.put('/:id', authenticateToken, authorizeAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'slider_images', maxCount: 10 }
]), workersController.updateWorker);

router.delete('/:id', authenticateToken, authorizeAdmin, workersController.deleteWorker);
// r
module.exports = router;

const express = require('express');
const router = express.Router();
const payController = require('../controllers/pay');
const upload = require('../middleware/uploadMiddleware');

router.post('/link', upload.none(), payController.getPaymentLink);

module.exports = router;

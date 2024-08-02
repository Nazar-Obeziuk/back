const express = require('express');
const router = express.Router();
const payController = require('../controllers/pay');
const upload = require('../middleware/uploadMiddleware');

router.post('/liqpay', upload.none(), payController.getPaymentLink);
router.post('/monobank', upload.none(), payController.createPaymentMonobank);

module.exports = router;

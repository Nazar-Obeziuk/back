const express = require("express");
const router = express.Router();

const pay = require("../controllers/pay");

router.get("/", pay.createPayment);

module.exports = router;

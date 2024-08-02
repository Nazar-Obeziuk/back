const LiqPay = require("../lib/liqpay");
const Monobank = require('../lib/monobank');

const liqpay = new LiqPay(
    process.env.LIQPAY_PUBLIC_KEY,
    process.env.LIQPAY_PRIVATE_KEY
);

const generateUniqueOrderId = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:.]/g, "");
    const randomPart = Math.floor(Math.random() * 10000);
    return `order_${timestamp}_${randomPart}`;
};

exports.getPaymentLink = (req, res) => {
    const { amount, language, description } = req.body;

    const params = {
        version: 3,
        action: "pay",
        amount: amount,
        currency: "UAH",
        description: description,
        order_id: generateUniqueOrderId(),
        language: language || "uk",
    };
    const link = liqpay.cnb_link(params);
    res.send({ link });
};


const monobank = new Monobank(process.env.MONOBANK_TOKEN);

exports.createPaymentMonobank = async (req, res) => {
    try {
        const { amount, ccy, redirectUrl, webHookUrl } = req.body;

        console.log('Request data:', { amount, ccy, redirectUrl, webHookUrl });

        const payment = await monobank.createPayment((amount * 100), ccy, redirectUrl, webHookUrl);
        res.send({ payment });
    } catch (error) {
        console.error('Error creating payment:', error.response ? error.response.data : error.message);
        res.status(500).send({ error: error.message });
    }
};
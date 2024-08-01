const LiqPay = require('../lib/liqpay');

const liqpay = new LiqPay('sandbox_i92883785959', 'sandbox_Q3JbH8QzJ07YoaIdnmV6cRxhYC7pFJwFWuxTTHcY');

exports.getPaymentLink = (req, res) => {

    const { amount, language } = req.body;

    const params = {
        version: 3,
        action: 'pay',
        amount: amount,
        currency: 'UAH',
        description: 'Test payment',
        order_id: 'order12345',
        language: language || 'uk'
    };
    const link = liqpay.cnb_link(params);
    res.send({ link });
};

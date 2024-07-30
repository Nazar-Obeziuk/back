const axios = require('axios');
const CryptoJS = require('crypto-js');

const myHost = 'https://your-insole-shop.com';

exports.createPayment = async (req, res) => {
    let randomTime = ((Math.random() * 30) + 2) * 100;
    setTimeout(async () => {
        console.log("create-payment");
        const merchantId = "1396424";
        const password = "test";

        // Статичні значення для тестування
        const order_id = "12345678942313123";
        const firstName = "John";
        const lastName = "Doe";
        const phoneNumber = "1234567890";
        const amount = 100;

        const order_desc = `Order for ${firstName} ${lastName}, Phone: ${phoneNumber}`;

        try {
            const requestData = {
                "order_id": order_id,
                "order_desc": order_desc,
                "currency": "USD",
                "response_url": myHost + "/payment-success",
                "amount": amount * 100,
                "merchant_data": JSON.stringify({ firstName, lastName, phoneNumber })
            };

            requestData['signature'] = getSignature(merchantId, password, requestData);

            console.log('Request Data:', requestData);

            const response = await axios.post('https://pay.fondy.eu/api/checkout/url/', { "request": requestData }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Fondy API Response:', response.data);

            const data = response.data;
            const checkoutUrl = data.response.checkout_url;
            res.json({ checkout_url: checkoutUrl });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }, randomTime);
}

function getSignature(merchant_id, password, params) {
    params['merchant_id'] = merchant_id;
    params = Object.keys(params)
        .sort()
        .map(key => params[key])
        .filter(value => value !== '')
        .join('|');
    params = password + '|' + params;
    return CryptoJS.SHA1(params).toString(CryptoJS.enc.Hex);
}

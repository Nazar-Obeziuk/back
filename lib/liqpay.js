const crypto = require('crypto');
const axios = require('axios');

class LiqPay {
    constructor(publicKey, privateKey) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    cnb_link(params) {
        const data = Buffer.from(JSON.stringify(this.cnb_params(params))).toString('base64');
        const signature = this.str_to_sign(this.privateKey + data + this.privateKey);
        return `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`;
    }

    cnb_params(params) {
        if (!params.version) throw new Error('version is null');
        if (!params.amount) throw new Error('amount is null');
        if (!params.description) throw new Error('description is null');

        params.public_key = this.publicKey; // Додаємо публічний ключ

        params.version = Number(params.version);
        params.amount = Number(params.amount);

        Object.keys(params).forEach(key => {
            if (typeof params[key] !== 'string') {
                params[key] = String(params[key]);
            }
        });

        return params;
    }

    str_to_sign(str) {
        if (typeof str !== 'string') throw new Error('Input must be a string');
        return crypto.createHash('sha1').update(str).digest('base64');
    }

    async api(path, params) {
        if (!params.version) throw new Error('version is null');
        const url = `https://www.liqpay.ua/api${path}`;
        const data = Buffer.from(JSON.stringify(this.cnb_params(params))).toString('base64');
        const signature = this.str_to_sign(this.privateKey + data + this.privateKey);

        const response = await axios.post(url, {
            data,
            signature
        });

        if (response.status !== 200) {
            throw new Error(`Request failed with status code: ${response.status}`);
        }

        return response.data;
    }
}

module.exports = LiqPay;

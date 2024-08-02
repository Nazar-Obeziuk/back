const axios = require('axios');

class Monobank {
    constructor(apiToken) {
        this.apiToken = apiToken;
        this.apiUrl = 'https://api.monobank.ua/api/merchant/invoice/create';
    }

    async createPayment(amount, ccy, redirectUrl, webHookUrl = '') {
        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    amount: Number(amount), // Переконайтеся, що це число
                    ccy: Number(ccy), // Переконайтеся, що це число
                    redirectUrl: String(redirectUrl), // Переконайтеся, що це рядок
                    webHookUrl: String(webHookUrl) // Переконайтеся, що це рядок (може бути порожнім)
                },
                {
                    headers: {
                        'X-Token': this.apiToken,
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Failed to create payment: ${error.response.data.errorDescription || error.response.statusText}`);
            }
            throw new Error(`Failed to create payment: ${error.message}`);
        }
    }
}

module.exports = Monobank;

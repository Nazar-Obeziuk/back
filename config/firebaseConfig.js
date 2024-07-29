const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Завантажити змінні середовища з .env файлу
dotenv.config();

// Ініціалізуйте Firebase Admin SDK з обліковими даними зі змінної середовища
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'prostopoo-cb3a5.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = bucket;

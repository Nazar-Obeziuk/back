const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadFile } = require('../controllers/storageController');

router.post('/upload', upload.single('file'), async (req, res) => {
    const { folder, name } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const url = await uploadFile(folder, name, file.buffer, file.mimetype);
        console.log(url);
        res.status(200).send({ url });
    } catch (err) {
        res.status(500).send('Error uploading file');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Pinata credentials
const PINATA_API_KEY = '7d9a04afe545fd7a1138';
const PINATA_SECRET_API_KEY = 'ba99f263e9a2d77766a4f82d25ae966652727a782217b0e9a71ca601f214973d';

const upload = multer({ dest: 'uploads/' });

router.post('/upload-to-pinata', upload.single('file'), async (req, res) => {
  try {
    const fileStream = fs.createReadStream(req.file.path);
    const formData = new FormData();
    formData.append('file', fileStream);

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, ipfsHash: response.data.IpfsHash });
  } catch (error) {
    console.error('Pinata Upload Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to upload to Pinata' });
  }
});

module.exports = router;

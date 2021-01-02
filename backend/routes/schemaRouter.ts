const express = require('express');

const router = express.Router();

// const schemaController = require('../controllers/schemaController');
import schemaController from '../controllers/schemaController';

console.log(schemaController.skipFileUpload);

router.get('/skip-file-upload', schemaController.skipFileUpload, (req, res) => {
  res.status(200).json('skipped file upload');
});

router.post('/upload-file', (req, res) => {
  res.status(200).json(res.locals);
});

router.post('/input-schema', schemaController.inputSchema, (req, res) => {
  res.status(200).json(res.locals);
});

//this needs to be module.exports or it will crash
module.exports = router;

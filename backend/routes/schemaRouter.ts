const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

const schemaController = require('../controllers/schemaController');

router.get('/skip-file-upload', schemaController.skipFileUpload, (req, res) => {
  res.status(200).json('skipped file upload');
});

router.post('/upload-file', schemaController.fileUpload, (req, res) => {
  res.status(200).json(res.locals);
});

router.post('/input-schema', schemaController.inputSchema, (req, res) => {
  res.status(200).json(res.locals);
});

export default router;

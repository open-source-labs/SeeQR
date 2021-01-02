const express = require('express');

const router = express.Router();

const dbController = require('../controllers/dbController');

router.get('return-db-list', dbController.returnDbList, (req, res) => {
  res.status(200).json(res.locals);
});

router.get('change-db', dbController.changeDb, (req, res) => {
  res.status(200).json(res.locals);
});

export default router;

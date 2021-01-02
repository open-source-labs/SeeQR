const express = require('express');

const router = express.Router();

const queryController = require('../controllers/queryController');

router.get(
  'return-db-list',
  queryController.executeQueryUntracked,
  (req, res) => {
    res.status(200).json(res.locals);
  }
);

router.get('change-db', queryController.executeQueryTracked, (req, res) => {
  res.status(200).json(res.locals);
});

module.exports = router;

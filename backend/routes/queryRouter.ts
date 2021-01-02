const express = require('express');

const router = express.Router();

const queryController = require('../controllers/queryController');

router.get(
  'execute-query-untracked',
  queryController.executeQueryUntracked,
  (req, res) => {
    res.status(200).json(res.locals);
  }
);

router.get(
  'execute-query-tracked',
  queryController.executeQueryTracked,
  (req, res) => {
    res.status(200).json(res.locals);
  }
);

router.get(
  'generate-dummy-data',
  queryController.generateDummyData,
  (req, res) => {
    res.status(200).json(res.locals);
  }
);

module.exports = router;

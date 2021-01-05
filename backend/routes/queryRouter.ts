const express = require('express');

const router = express.Router();

import queryController from '../controllers/queryController';

router.get(
  '/execute-query-untracked',
  queryController.executeQueryUntracked,
  (req, res) => {
    res.status(200).json(res.locals);
  }
);

router.put(
  '/execute-query-tracked',
  queryController.executeQueryTracked,
  (req, res) => {
    res.status(200).json(res.locals);
  }
);

router.get(
  '/generate-dummy-data',
  queryController.generateDummyData,
  (req, res) => {
    res.status(200).json(res.locals);
  }
);

export default router;

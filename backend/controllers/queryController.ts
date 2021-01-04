const db = require('../models');

const queryController = {
  executeQueryUntracked: (req, res, next) => {
    next();
  },

  executeQueryTracked: (req, res, next) => {
    next();
  },
  generateDummyData: (req, res, next) => {
    next();
  },
};

export default queryController;

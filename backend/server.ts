const express = require('express');
const server = express();
const path = require('path');
const schemaRouter = ./routes/schemaRouter;
const dbRouter = ./routes/dbRouter;
const queryRouter = ./routes/queryRouter;


// Body Parser Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.use(express.static('dist'));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
})

//router for 'skip-file-upload', 'upload-file', and 'input-schema'
server.use('/schema', schemaRouter);

//router for 'skip-file-upload', 'upload-file', and 'input-schema'
server.use('/dbLists', dbRouter);

//router for 'execute-query-untracked', 'execute-query-tracked', 'generate-dummy-data'
server.use('/query', queryRouter);

// default error handler
server.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});


server.listen(3000, () => console.log('listening on port 3000'));

module.exports = server;
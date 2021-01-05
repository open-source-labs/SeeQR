const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const server = express();
// const schemaRouter = require('./routes/schemaRouter');
// const dbRouter = require('./routes/dbRouter');
import queryRouter from './routes/queryRouter';

// Body Parser Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// server.use(express.static('dist'));

server.get('/', makeDB, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.use(express.static('dist'));

async function makeDB(req, res, next) {  
  const options = {
    method: 'POST',
    headers: { 
      'Authorization': 'Basic Ojg4MDVmN2U2LTBiZWUtNDcwNC04OWRlLTU5YmM2ZTJlNWEyYw==',
    }
  }
  const response = await fetch('https://customer.elephantsql.com/api/instances?name=test9&plan=turtle&region=amazon-web-services::us-east-1', options);
  const data = await response.json();
  const { id } = data;
  setTimeout(() => deleteDB(id), 30000);
  next();
}

async function deleteDB(id) {
  const options = {
    method: 'DELETE',
    headers: { 
      'Authorization': 'Basic Ojg4MDVmN2U2LTBiZWUtNDcwNC04OWRlLTU5YmM2ZTJlNWEyYw==',
    }
  }
  const response = await fetch(`https://customer.elephantsql.com/api/instances/${id}`, options);
  console.log(response.status);
}

//router for 'skip-file-upload', 'upload-file', and 'input-schema'
// server.use('/schema', schemaRouter);

//router for 'skip-file-upload', 'upload-file', and 'input-schema'
// server.use('/dbLists', dbRouter);

// router for 'execute-query-untracked', 'execute-query-tracked', 'generate-dummy-data'
// server.use('/query', queryRouter);

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

export default server;

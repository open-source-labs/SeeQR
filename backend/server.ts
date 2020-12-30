const express = require('express');
const server = express();
const path = require('path');

server.use(express.static('dist'));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
})

server.listen(3000, () => console.log('listening on port 3000'));

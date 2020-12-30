const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('dist'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
})

app.listen(3000, () => console.log('listening on port 3000'));

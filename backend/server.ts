const express = require('express');
const server = express();
const path = require('path');
const schemaRouter = ./routes/schemaRouter;
const dbRouter = ./routes/dbRouter;



// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

server.use(express.static('dist'));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
})

//router for 'skip-file-upload', 'upload-file', and 'input-schema'
server.use('/schema', schemaRouter);

//router for 'skip-file-upload', 'upload-file', and 'input-schema'
server.use('/dbLists', dbRouter);


server.listen(3000, () => console.log('listening on port 3000'));

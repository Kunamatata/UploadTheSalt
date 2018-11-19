require('dotenv').config();

const path = require('path');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();

let PORT = 3000;
const FILE_SIZE_LIMIT = 1000 * 1000 * 2;


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../client/build/pending/');
  },
  filename: function(req, file, cb) {
    const match = file.originalname.match(/\.(gif|jpg|jpeg|tiff|png)$/i);
    const filename = file.originalname.substring(0, match.index) + new Date().getTime() + match[0]
    cb(null, filename);
  }
});


const upload = multer({ storage: storage, limits: { fileSize: FILE_SIZE_LIMIT } }).single('image');

if (process.env.NODE_ENV === 'production') {
  PORT = 8081;
  // Serve any static files
  app.use(express.static(path.join(__dirname, '../client/build')));
  // Handle React routing, return all requests to React app
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.use(bodyParser());

app.post('/api/image', (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      const { message } = err;
      return res.status(400).send({ message: message + " LIMIT IS 1MB" });
    }
    if (req.file) {
      return res.sendStatus(200)
    } else {
      return res.status(400).send({ message: "Please select a file!" });
    }

  })
});

app.post('/api/test', (req, res) => {
  // quick unity test
  console.log(req.body);
  res.sendStatus(200);
})

app.get('/api/images', (req, res) => {
  // client.get('image', ())
  new Promise((resolve, reject) => {
    fs.readdir('../client/build/pending/', (err, pendingFiles) => {
      fs.readdir('../client/build/uploads/', async(err, files) => {
        let numberOfPendingFiles = 0;
        if (pendingFiles) {
          numberOfPendingFiles = pendingFiles.length;
        }
        if (files) {
          let sortedFiles = files.map(file => {
            return {
              name: file,
              time: fs.statSync("../client/build/uploads/" + file).mtime.getTime()
            }
          }).sort((a, b) => b.time - a.time).map(v => v.name)
          return resolve({ files: sortedFiles, numberOfPendingFiles });
        }
        return resolve({ files: [], numberOfPendingFiles });
      })
    })
  }).then(data => {
    client.setex('images', 60, data);
    res.send(data)
  })

})

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}!`));
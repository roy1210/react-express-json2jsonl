const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const jsonl = require('jsonl');
const path = require('path');

const app = express();

app.use(fileUpload());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;

  file.mv(`${__dirname}/client/public/uploads/in.json`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ fileName: file.name, filePath: `/uploads/in.json` });
    try {
      fs.createReadStream(`${__dirname}/client/public/uploads/in.json`)
        .pipe(jsonl())
        .pipe(
          fs.createWriteStream(`${__dirname}/client/public/downloads/out.jsonl`)
        );
    } catch (e) {
      console.log(e);
    }
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5001;

app.listen(port, () => console.log('Server Started...'));

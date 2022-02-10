const express = require('express');
const path = require('path');
const app = express();
const uuid = require('uuid');
const fs = require('fs');
const { default: axios } = require('axios');

const endpoint = 'https://9tary5tnu5.execute-api.ap-east-1.amazonaws.com/Prod/image'

app.post('/image', (req, res) => {
        var data = [];
        req.on('data', chunk => {
            data.push(chunk);
        })
        req.on('end', () => {
            var filename = uuid.v4();
            var buffer = Buffer.concat(data);
            fs.writeFileSync("images/" + filename + '.jpg', buffer);
            res.send(filename);
        })
    })
app.get('/image/:filename', (req, res) => {
        var filename = req.params.filename;
        var buffer = fs.readFileSync('images/' + filename + '.jpg')
        res.send(buffer)
    })
app.get('/inference/image/:filename', (req, res) => {
        var filename = req.params.filename;
        var buffer = fs.readFileSync('images/' + filename + '.jpg')
        options = {headers: {'content-type': 'image/jpg'}}
        var resuult = axios.post(endpoint, buffer, options)
          .then((response) => {
              res.send(response.data)
          }, (error) => {
            res.status(400);
            res.send('client error');
            console.log(error);
          });
    })

app.use(express.static(path.join(__dirname, 'build')));

+app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'build', 'index.html'));
 });

app.listen(3000);

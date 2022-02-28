const { createProxyMiddleware } = require('http-proxy-middleware');
const uuid = require('uuid');
const fs = require('fs');
const { default: axios } = require('axios');
const url = require('url');

const baseUrl = 'https://rs0vxek8w9.execute-api.ap-east-1.amazonaws.com/prod'

module.exports = function(app) {
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
    app.get('/sample/:case/:filename', (req, res) => {
        var casename = req.params.case;
        var filename = req.params.filename;
        var buffer = fs.readFileSync('samples/' + casename + '/' + filename)
        res.send(buffer)
    })
    app.get('/samples/:case', (req, res) => {
        var casename = req.params.case;
        var items = [];

        fs.readdir('samples/' + casename, function (err, files) {
            files.forEach(function (file, index) {
                items.push('/sample/'+ casename + '/' + file)
            });
            res.send(JSON.stringify(items))
        });
    })
    app.get('/inference/image/:case/:filename', (req, res) => {
        var casename = req.params.case;
        var filename = req.params.filename;
        var buffer = fs.readFileSync('images/' + filename + '.jpg')
        options = { headers: {'content-type': 'image/jpg'}, params : {model: casename}}
        var resuult = axios.post(baseUrl + '/inference', buffer, options)
            .then((response) => {
                res.send(response.data)
            }, (error) => {
                res.status(400);
                res.send('client error');
                console.log(error);
            }
        );
    })
    app.get('/inference/sample/:case/:filename', (req, res) => {
        var casename = req.params.case;
        var filename = req.params.filename;
        var buffer = fs.readFileSync('samples/' + casename + '/' + filename)
        options = {headers: {'content-type': 'image/png'}, params : {model: casename}}
        var resuult = axios.post(baseUrl + '/inference', buffer, options)
            .then((response) => {
                res.send(response.data)
            }, (error) => {
                res.status(400);
                res.send('client error');
                console.log(error);
            }
        );
    })
    app.get('/file/download', (req, res) => {
        var uri = decodeURIComponent(req.query['uri']);
        axios({
            url: uri,
            method: 'GET',
            responseType: 'arraybuffer', 
        }).then((response) => {
            res.setHeader('content-type', response.headers['content-type']);
            res.send(response.data);
        });
    })
    app.use(createProxyMiddleware('/transformjob', {
        target: baseUrl + '/transformjob',
        pathRewrite: {
            '^/transformjob': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
    app.use(createProxyMiddleware('/trainingjob', {
        target: baseUrl + '/trainingjob',
        pathRewrite: {
            '^/trainingjob': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
    app.use(createProxyMiddleware('/model', {
        target: baseUrl + '/model',
        pathRewrite: {
            '^/model': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
    app.use(createProxyMiddleware('/endpoint', {
        target: baseUrl + '/endpoint',
        pathRewrite: {
            '^/endpoint': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
    app.use(createProxyMiddleware('/helper', {
        target: baseUrl + '/helper',
        pathRewrite: {
            '^/helper': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
    app.use(createProxyMiddleware('/api', {
        target: baseUrl + '/api',
        pathRewrite: {
            '^/api': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
    app.use(createProxyMiddleware('/greengrass', {
        target: baseUrl + '/greengrass',
        pathRewrite: {
            '^/greengrass': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
};
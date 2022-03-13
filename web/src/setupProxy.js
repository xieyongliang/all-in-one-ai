const { createProxyMiddleware } = require('http-proxy-middleware');
const uuid = require('uuid');
const fs = require('fs');
const { default: axios } = require('axios');
const url = require('url');

const baseUrl = 'https://4a8oxccfn7.execute-api.ap-southeast-1.amazonaws.com/prod'

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
        axios.post(baseUrl + '/inference', buffer, options)
            .then((response) => {
                res.send(response.data)
            }, (error) => {
                    res.status(400);
                    res.send('client error');
                    console.log(error);
                }
            ).catch((e) => {
                console.log(e)
            }
        );
    })
    app.get('/inference/sample/:case/:filename', (req, res) => {
        var casename = req.params.case;
        var filename = req.params.filename;
        var buffer = fs.readFileSync('samples/' + casename + '/' + filename)
        options = {headers: {'content-type': 'image/png'}, params : {model: casename}}
        axios.post(baseUrl + '/inference', buffer, options)
            .then((response) => {
                res.send(response.data)
            }, (error) => {
                    res.status(400);
                    res.send('client error');
                    console.log(error);
                }
            ).catch((e) => {
                console.log(e)
            }
        );
    })
    app.get('/file/download', (req, res) => {
        var uri = decodeURIComponent(req.query['uri']);
        axios({ url: uri, method: 'GET', responseType: 'arraybuffer'})
            .then((response) => {
                    res.setHeader('content-type', response.headers['content-type']);
                    res.send(response.data);
                }
            ).catch((e) => {
                console.log(e)
            }
        );
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
    app.use(createProxyMiddleware('/modelpackage', {
        target: baseUrl + '/modelpackage',
        pathRewrite: {
            '^/modelpackage': ''
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
    app.use(createProxyMiddleware('/function', {
        target: baseUrl + '/function',
        pathRewrite: {
            '^/function': ''
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
    app.use(createProxyMiddleware('/pipeline', {
        target: baseUrl + '/pipeline',
        pathRewrite: {
            '^/pipeline': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
};
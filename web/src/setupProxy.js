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
            try {
                var file_name = uuid.v4();
                var buffer = Buffer.concat(data);
                fs.writeFileSync('images/' + file_name + '.jpg', buffer);
                res.send(file_name);
            }
            catch (error) {
                console.log(error);
            }
        })
    })
    app.get('/image/:file_name', (req, res) => {
        var file_name = req.params.file_name;
        var buffer = fs.readFileSync('images/' + file_name + '.jpg');
        res.send(buffer);
    })
    app.get('/inference/image/:file_name', (req, res) => {
        try {
            var endpoint_name = req.query['endpoint_name'];
            var file_name = req.params.file_name;
            var buffer = fs.readFileSync('images/' + file_name + '.jpg');
            options = { headers: {'content-type': 'image/jpg'}, params : {endpoint_name: endpoint_name}};
            axios.post(baseUrl + '/inference', buffer, options)
                .then((response) => {
                    res.send(response.data);
                }, (error) => {
                        res.status(400);
                        res.send('client error');
                        console.log(error);
                    }
                ).catch((e) => {
                    console.log(e);
                }
            );
        }
        catch (error) {
            console.log(error)
        }
    })
    app.get('/inference/sample', (req, res) => {
        try {
            var endpoint_name = req.query['endpoint_name'];
            var bucket = req.query['bucket'];
            var key = req.query['key'];
            var buffer = {
                'bucket': bucket,
                'image_uri': key
            }
            options = {headers: {'content-type': 'application/json'}, params : {endpoint_name: endpoint_name}};
            axios.post(baseUrl + '/inference', buffer, options)
                .then((response) => {
                    res.send(response.data)
                }, (error) => {
                        res.status(400);
                        res.send('client error');
                        console.log(error);
                    }
                ).catch((e) => {
                    console.log(e);
                }
            );
        }
        catch (error) {
            console.log(error)
        }
    })
    app.get('/file/download', (req, res) => {
        try {
            var uri = decodeURIComponent(req.query['uri']);
            axios({ url: uri, method: 'GET', responseType: 'arraybuffer'})
                .then((response) => {
                        res.setHeader('content-type', response.headers['content-type']);
                        res.send(response.data);
                    }
                ).catch((e) => {
                    console.log(e);
                }
            );
        }
        catch (error) {
            console.log(error)
        }
    })
    app.get('/search/image', (req, res) => {
        try {
                var endpoint_name = req.query['endpoint_name'];
                var file_name = req.query['file_name'];
                var data = fs.readFileSync('images/' + file_name + '.jpg');
        
                options = {headers: {'content-type': 'image/jpg'}, params: {endpoint_name: endpoint_name}};
                axios.post(baseUrl + '/search/image', data, options)
                .then((response) => {
                    res.send(response.data);
                }, (error) => {
                        res.status(400);
                        res.send('client error');
                        console.log(error);
                    }
                ).catch((e) => {
                    console.log(e);
                }
            );
        }
        catch (error) {
            console.log(error)
        }
    })
    app.post('/industrialmodel', (req, res) => {
        var body = [];
        req.on('data', chunk => {
            body += chunk
        })
        req.on('end', () => {
            try {
                data = JSON.parse(body);
                var file_name = data.file_name;
                var buffer = fs.readFileSync('images/' + file_name + '.jpg');
                data['file_content'] = buffer;

                options = {headers: {'content-type': 'application/json'}};
                axios.post(baseUrl + '/industrialmodel', body, options)
                    .then((response) => {
                        res.send(response.data);
                    }, (error) => {
                            res.status(400);
                            res.send('client error');
                            console.log(error);
                        }
                    ).catch((e) => {
                        console.log(e);
                    }
                );
            }
            catch (error) {
                console.log(error)
            }
        })
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
    app.use(createProxyMiddleware('/industrialmodel', {
        target: baseUrl + '/industrialmodel',
        pathRewrite: {
            '^/industrialmodel': ''
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
    app.use(createProxyMiddleware('/s3', {
        target: baseUrl + '/s3',
        pathRewrite: {
            '^/s3': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
};
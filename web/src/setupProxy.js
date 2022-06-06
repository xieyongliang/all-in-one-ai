const { createProxyMiddleware } = require('http-proxy-middleware');
const uuid = require('uuid');
const fs = require('fs');
const { default: axios } = require('axios');
const url = require('url');
var Jimp = require('jimp');

//const baseUrl = 'https://s8upvi47qg.execute-api.ap-southeast-1.amazonaws.com/Prod'
const baseUrl = 'https://b2yr0i0r6e.execute-api.ap-east-1.amazonaws.com/Prod'

module.exports = function(app) {
    app.post('/_image', (req, res) => {
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
    app.get('/_image/:file_name', (req, res) => {
        var file_name = req.params.file_name;
        var buffer = fs.readFileSync('images/' + file_name + '.jpg');
        res.send(buffer);
    })
    app.get('/_inference/image/:file_name', (req, res) => {
        try {
            var endpoint_name = req.query['endpoint_name'];
            var file_name = req.params.file_name;
            var crop = req.query['crop'];

            if(crop === undefined) {
                var buffer = fs.readFileSync('images/' + file_name + '.jpg');
                var options = { headers: {'content-type': 'image/jpg'}, params : {endpoint_name: endpoint_name}};
                axios.post(baseUrl + '/inference', buffer, options)
                    .then((response) => {
                        res.send(response.data);
                    }, (error) => {
                            res.status(400);
                            res.send(res.data);
                            console.log(error);
                        }
                    ).catch((e) => {
                        console.log(e);
                    }
                );
            }
            else {
                Jimp.read('images/' + file_name + '.jpg', function (err, image) {
                    var rect = JSON.parse(crop)
                    var width = image.bitmap.width
                    var height = image.bitmap.height
                    var x = parseInt((rect.x - rect.w/2) * width)
                    var y = parseInt((rect.y - rect.h/2) * height)
                    var w = parseInt(rect.w * width)
                    var h = parseInt(rect.h * height)
                    image.crop(x, y, w, h);
                    var options = { headers: {'content-type': 'image/jpg'}, params : {endpoint_name: endpoint_name}};
                    image.write('./images/crop.png')
                    image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                        axios.post(baseUrl + '/inference', buffer, options)
                            .then((response) => {
                                response.data.bbox.forEach((item) => {
                                    item[0][0] += x;
                                    item[0][1] += y;
                                    item[1][0] += x;
                                    item[1][1] += y;
                                    item[2][0] += x;
                                    item[2][1] += y;
                                    item[3][0] += x;
                                    item[3][1] += y;
                                });
                                res.send(response.data);
                            }, (error) => {
                                    res.status(400);
                                    res.send(res.data);
                                    console.log(error);
                                }
                            ).catch((e) => {
                                console.log(e);
                            }
                            );     
                        }
                    );
                })
            }
        }
        catch (error) {
            console.log(error)
        }
    })
    app.get('/_inference/sample', (req, res) => {
        try {
            var endpoint_name = req.query['endpoint_name'];
            var bucket = req.query['bucket'];
            var key = req.query['key'];
            var crop = req.query['crop'];
            
            if(crop === undefined) {
                var buffer = {
                    'bucket': bucket,
                    'image_uri': key,
                    'content_type': 'application/json'
                }
                options = {headers: {'content-type': 'application/json'}, params : {endpoint_name: endpoint_name}};
                axios.post(baseUrl + '/inference', buffer, options)
                    .then((response) => {
                        res.send(response.data)
                    }, (error) => {
                            res.status(400);
                            res.send(res.data);
                            console.log(error);
                        }
                    ).catch((e) => {
                        console.log(e);
                    }
                );
            }
            else {
                var s3uri = `s3://${bucket}/${key}`
                axios.get(baseUrl + '/s3', {params : { s3uri : s3uri}})
                    .then((response) => {
                        var httpuri = response.data.payload;
                        Jimp.read(httpuri, function (err, image) {
                            var rect = JSON.parse(crop)
                            var width = image.bitmap.width
                            var height = image.bitmap.height
                            var x = parseInt((rect.x - rect.w/2) * width)
                            var y = parseInt((rect.y - rect.h/2) * height)
                            var w = parseInt(rect.w * width)
                            var h = parseInt(rect.h * height)
                            image.crop(x, y, w, h);
                            var options = { headers: {'content-type': 'image/jpg'}, params : {endpoint_name: endpoint_name}};
                            image.write('./images/crop.png')
                            image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                                axios.post(baseUrl + '/inference', buffer, options)
                                    .then((response) => {
                                        response.data.bbox.forEach((item) => {
                                            item[0][0] += x;
                                            item[0][1] += y;
                                            item[1][0] += x;
                                            item[1][1] += y;
                                            item[2][0] += x;
                                            item[2][1] += y;
                                            item[3][0] += x;
                                            item[3][1] += y;
                                        });
                                        res.send(response.data);
                                    }, (error) => {
                                            res.status(400);
                                            res.send(res.data);
                                            console.log(error);
                                        }
                                    ).catch((e) => {
                                        console.log(e);
                                    }
                                    );     
                                }
                            );
                        })
                    }
                )
            }
        }
        catch (error) {
            console.log(error)
        }
    })
    app.get('/_file/download', (req, res) => {
        try {
            var uri = decodeURIComponent(req.query['uri']);
            axios({ url: uri, method: 'GET', responseType: 'arraybuffer'})
                .then((response) => {
                    res.setHeader('content-type', response.headers['content-type']);
                    res.send(response.data);
                }, (error) => {
                        res.status(400);
                        res.send(res.data);
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
    app.get('/_search/image', (req, res) => {
        try {
                var endpoint_name = req.query['endpoint_name'];
                var industrial_model = req.query['industrial_model']
                var file_name = req.query['file_name'];
                var data = fs.readFileSync('images/' + file_name + '.jpg');
        
                var options = {headers: {'content-type': 'image/jpg'}, params: {endpoint_name: endpoint_name, industrial_model: industrial_model}};
                axios.post(baseUrl + '/search/image', data, options)
                .then((response) => {
                    res.send(response.data);
                }, (error) => {
                        res.status(400);
                        res.send(res.data);
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
    app.post('/_industrialmodel', (req, res) => {
        var data = [];
        req.on('data', chunk => {
            data = data.concat(chunk)
        })
        req.on('end', () => {
            try {
                var body = JSON.parse(data);
                var model_id = body.model_id
                var file_name = body.file_name;
                if(file_name !== '') {
                    var buffer = fs.readFileSync('images/' + file_name + '.jpg');
                    body['file_content'] = buffer;
                }

                options = {headers: {'content-type': 'application/json'}};
                if(model_id === undefined) {
                    axios.post(baseUrl + '/industrialmodel', body, options)
                        .then((response) => {
                            res.send(response.data);
                        }, (error) => {
                                res.status(400);
                                res.send(res.data);
                                console.log(error);
                            }
                        ).catch((e) => {
                            console.log(e);
                        })
                    }
                else {
                    delete body.model_id
                    axios.post(baseUrl + `/industrialmodel/${model_id}`, body, options)
                        .then((response) => {
                            res.send(response.data);
                        }, (error) => {
                                res.status(400);
                                res.send(res.data);
                                console.log(error);
                            }
                        ).catch((e) => {
                            console.log(e);
                        })
                }
            }    
            catch (error) {
                console.log(error)
            }
        })
    })
    app.use(createProxyMiddleware('/inference', {
        target: baseUrl + '/inference',
        pathRewrite: {
            '^/inference': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
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
    app.use(createProxyMiddleware('/search/import', {
        target: baseUrl + '/search/import',
        pathRewrite: {
            '^/search/import': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));
    app.use(createProxyMiddleware('/train', {
        target: baseUrl + '/train',
        pathRewrite: {
            '^/train': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));    
    app.use(createProxyMiddleware('/deploy', {
        target: baseUrl + '/deploy',
        pathRewrite: {
            '^/deploy': ''
        },
        changeOrigin: true,
        secure: false,
        ws: false,
    }));    
};
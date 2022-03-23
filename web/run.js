const express = require('express');
const path = require('path');
const app = express();
const uuid = require('uuid');
const fs = require('fs');
const { default: axios } = require('axios');
const { createProxyMiddleware }  = require('http-proxy-middleware');

const baseUrl = 'https://4a8oxccfn7.execute-api.ap-southeast-1.amazonaws.com/prod'

app.post('/image', (req, res) => {
    var data = [];
    req.on('data', chunk => {
        data.push(chunk);
    })
    req.on('end', () => {
        try {
            var filename = uuid.v4();
            var buffer = Buffer.concat(data);
            fs.writeFileSync('images/' + filename + '.jpg', buffer);
            res.send(filename);
        }
        catch (error) {
            console.log(error)
        }
    })
})
app.get('/image/:filename', (req, res) => {
    var filename = req.params.filename;
    var buffer = fs.readFileSync('images/' + filename + '.jpg')
    res.send(buffer)
})
app.post('/ico', (req, res) => {
    var data = [];
    req.on('data', chunk => {
        data.push(chunk);
    })
    req.on('end', () => {
        try {
            var filename = uuid.v4();
            var buffer = Buffer.concat(data);
            fs.writeFileSync('public/' + filename + '.jpg', buffer);
            res.send(filename);
        }
        catch (error) {
            console.log(error)
        }
    })
})
app.get('/sample/:case/:filename', (req, res) => {
    try {
        var casename = req.params.case;
        var filename = req.params.filename;
        var buffer = fs.readFileSync('samples/' + casename + '/' + filename)
        res.send(buffer)
    }
    catch (error) {
        console.log(error)
    }
})
app.get('/samples/:case', (req, res) => {
    try {
        var casename = req.params.case;
        var items = [];

        fs.readdir('samples/' + casename, function (err, files) {
            files.forEach(function (file, index) {
                items.push('/sample/'+ casename + '/' + file)
            });
            res.send(JSON.stringify(items))
        });
    }
    catch (error) {
        console.log(error)
    }
})
app.get('/inference/image/:case/:filename', (req, res) => {
    try {
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
    }
    catch (error) {
        console.log(error)
    }
})
app.get('/inference/sample', (req, res) => {
    try {
        var casename = req.query['case'];
        var bucket = req.query['bucket']
        var key = req.query['key']
        var buffer = {
            'bucket': bucket,
            'image_uri': key
        }
        options = {headers: {'content-type': 'application/json'}, params : {model: casename}}
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
                console.log(e)
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
            data = JSON.parse(body)
            var filename = data.file_name;
            var buffer = fs.readFileSync('public/' + filename + '.jpg')
            data['file_content'] = buffer

            options = {headers: {'content-type': 'application/json'}}
            axios.post(baseUrl + '/industrialmodel', data, options)
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

app.use(express.static(path.join(__dirname, 'build')));

+app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'build', 'index.html'));
 });

app.listen(3000);

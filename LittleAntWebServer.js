
var url = require('url');
var cookieParser = require('cookie-parser')
var express = require('express');
var session = require('express-session')
var minimist = require('minimist');
var debug = true;
var http = require('http');
var https = require('https');
var fs = require("fs");
var path = require('path');
var proxy = require('http-proxy-middleware');

var argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: debug?"http://localhost:8090/":'https://localhost:8090/'
    }
});

var options =
    {
        key: fs.readFileSync('keys/server.key'),
        cert: fs.readFileSync('keys/server.crt')
    };


var app = express();
app.use(cookieParser());

var sessionHandler = session({
    secret: 'none',
    rolling: true,
    resave: true,
    saveUninitialized: true
});

app.use(sessionHandler);


var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
if(debug){
    http.createServer(app).listen(port, function () {
        console.log('Open ' + url.format(asUrl) );
    });
}else{
    https.createServer(options, app).listen(port, function () {
        console.log('Open ' + url.format(asUrl) );
    });
}


//app.use(express.static(path.join(__dirname, '/')));
//代理请求的地址,解决跨域问题
var maaeeTargetUrl = "http://www.maaee.com";//目标后端服务地址
var maaeeTargetUrlByHttps = "https://www.maaee.com";//目标后端服务地址
var ServerOf217Url = "http://60.205.86.217:8585";//目标后端服务地址
var jiaoxueServerTargetUrl = "http://jiaoxue.maaee.com:8989";//目标后端服务地址

//代理eduction请求路径
var proxyOptionOfEducation ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/Excoord_For_Education': "/Excoord_For_Education" }
};
app.use("/proxy/Excoord_For_Education",proxy(proxyOptionOfEducation));

//代理Excoord_PhoneService请求路径
var proxyOptionOfPhoneService ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/Excoord_PhoneService': "/Excoord_PhoneService" }
};
app.use("/proxy/Excoord_PhoneService",proxy(proxyOptionOfPhoneService));

//代理ant_service请求路径
var proxyOptionOfAntService ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/ant_service': "/ant_service" }
};
app.use("/proxy/ant_service",proxy(proxyOptionOfAntService));

//代理Excoord_PC请求路径
var proxyOptionOfExcoordPC ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/Excoord_PC': "/Excoord_PC" }
};
app.use("/proxy/Excoord_PC",proxy(proxyOptionOfExcoordPC));

//代理h5Point5请求路径
var proxyOptionOfH5Point5 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/h5Point5': "/h5Point5" }
};
app.use("/proxy/h5Point5",proxy(proxyOptionOfH5Point5));

//代理h5Point4请求路径
var proxyOptionOfH5Point4 ={
    target:maaeeTargetUrlByHttps,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/h5Point4': "/h5Point4" }
};
app.use("/proxy/h5Point4",proxy(proxyOptionOfH5Point4));

//代理h5Point3请求路径
var proxyOptionOfH5Point3 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/h5Point3': "/h5Point3" }
};
app.use("/proxy/h5Point3",proxy(proxyOptionOfH5Point3));

//代理h5Point3请求路径
var proxyOptionOfH5Point2 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/h5Point2': "/h5Point2" }
};
app.use("/proxy/h5Point2",proxy(proxyOptionOfH5Point2));

//代理h5Point3请求路径
var proxyOptionOfH5Point ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/h5Point': "/h5Point" }
};
app.use("/proxy/h5Point",proxy(proxyOptionOfH5Point));

//代理live2请求路径
var proxyOptionOfLive2 ={
    target:ServerOf217Url,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/live2': "/live2" }
};
app.use("/proxy/live2",proxy(proxyOptionOfLive2));

//代理live3请求路径
var proxyOptionOfLive3 ={
    target:ServerOf217Url,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/live3': "/live3" }
};
app.use("/proxy/live3",proxy(proxyOptionOfLive3));

//代理upload4请求路径
var proxyOptionOfUpload4 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload4': "/upload4" }
};
app.use("/proxy/upload4",proxy(proxyOptionOfUpload4));

//代理upload5请求路径
var proxyOptionOfUpload5 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload5': "/upload5" }
};
app.use("/proxy/upload5",proxy(proxyOptionOfUpload5));

//代理upload6请求路径
var proxyOptionOfUpload6 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload6': "/upload6" }
};
app.use("/proxy/upload6",proxy(proxyOptionOfUpload6));

//代理upload7请求路径
var proxyOptionOfUpload7 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload7': "/upload7" }
};
app.use("/proxy/upload7",proxy(proxyOptionOfUpload7));

//代理upload8请求路径
var proxyOptionOfUpload8 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload8': "/upload8" }
};
app.use("/proxy/upload8",proxy(proxyOptionOfUpload8));

//代理upload9请求路径
var proxyOptionOfUpload9 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload9': "/upload9" }
};
app.use("/proxy/upload9",proxy(proxyOptionOfUpload9));

//代理upload8请求路径
var proxyOptionOfUpload2 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload2': "/upload2" }
};
app.use("/proxy/upload2",proxy(proxyOptionOfUpload2));

//代理upload3请求路径
var proxyOptionOfUpload3 ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload3': "/upload3" }
};
app.use("/proxy/upload3",proxy(proxyOptionOfUpload3));

//代理upload请求路径
var proxyOptionOfUpload ={
    target:maaeeTargetUrl,
    changeOrigin:true,
    ws: true,
    pathRewrite: { '^/proxy/upload': "/upload" }
};
app.use("/proxy/upload",proxy(proxyOptionOfUpload));


//代理本地访问路径
app.get('/src/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/jquerylib/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/emojiPicker/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/textboxio/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/jQuery-File-Upload-9.11.2/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/hls-noom-master/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/thirdLib/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/static/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/jquery-photo-gallery/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, '', req.path));
});

app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', "favicon.ico"));
});

app.get('/*', function (req, res) {

    console.log(req.path);
    res.sendFile(path.join(__dirname, 'dist', req.path));
});

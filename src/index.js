import './index.html';
import './index.less';
 // const express = require('express')
// const path = require('path')
// const port = process.env.PORT || 8080
// import { browserHistory } from 'dva/router';
import dva from 'dva';

const app = dva({
    onError(e) {
        console.log("global error:"+e.message);
    },
});

// const app = dva({
//     history: browserHistory,
// });

// 通常用于加载静态资源
// app.use('/static');

// 在你应用 JavaScript 文件中包含了一个 script 标签
// 的 index.html 中处理任何一个 route
// app.get('*', function (request, response){
//    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
// })
/*
app.listen(port)
console.log("server started on port " + port)*/

app.router(require('./router'));
app.start('#root');

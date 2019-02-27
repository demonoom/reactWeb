const webpack = require('atool-build/lib/webpack');
const path = require('path');  //引入path模块
var HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// 引入 ParallelUglifyPlugin 插件
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = function (webpackConfig, env) {
    webpackConfig.babel.plugins.push('transform-runtime');
    webpackConfig.babel.plugins.push(['import', {
        libraryName: 'antd',
        style: 'css',
    }]);
    webpackConfig.babel.plugins.push(['import', {
        libraryName: 'style',
        style: 'css',
    }]);

    entry: {
        app: './src/index.js'
    }

    // Support hmr
    if (env === 'development') {
        /*webpackConfig.devtool = '#eval';*/
        webpackConfig.devtool = false;
        webpackConfig.babel.plugins.push('dva-hmr');
    } else {
        webpackConfig.babel.plugins.push('dev-expression');
    }

    // Don't extract common.js and common.css
    webpackConfig.plugins = webpackConfig.plugins.filter(function (plugin) {
        return !(plugin instanceof webpack.optimize.CommonsChunkPlugin);
    });

    // Support CSS Modules
    // Parse all less files as css module.
    webpackConfig.module.loaders.forEach(function (loader, index) {
        if(loader.test.toString() === '/\\.html?$/'){
            loader.loader = 'html';
        }
        if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.less$') > -1) {
            loader.include = /node_modules/;
            loader.test = /\.less$/;
        }
        if (loader.test.toString() === '/\\.module\\.less$/') {
            loader.exclude = /node_modules/;
            loader.test = /\.less$/;
        }
        if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.css$') > -1) {
            loader.include = /node_modules/;
            loader.test = /\.css$/;
        }
        if (loader.test.toString() === '/\\.module\\.css$/') {
            loader.exclude = /node_modules/;
            loader.test = /\.css$/;
        }
        //加载第三方的样式文件---textboxio富客户端组件
        if (loader.test.toString() === '/\\.textboxio\\.css$/') {
            loader.exclude = /textboxio/;
            loader.test = /\.css$/;
        }
        //加载第三方的样式文件---emojiPicker富客户端组件
        if (loader.test.toString() === '/\\.emojiPicker\\.css$/') {
            loader.exclude = /emojiPicker/;
            loader.test = /\.css$/;
        }
    });

    // 添加一个plugin
    webpackConfig.plugins.push(
        //将开发模式变为生产模式
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),

        //抽取CSS文件插件
        new ExtractTextPlugin({filename: '[name].[contenthash:8].css?v=1', allChunks: true}),

        new HtmlWebpackPlugin({
            title: "HtmlPlugin",
            // filename :"index.html",
            template: "./index_deploy.html",
            filename: 'index.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
            // template:(useDefinedHtml ? useDefinedHtml : defaultHtml),
            //we must use html-loader here instead of file-loader
            inject:"body",
            hash:true,
            chunks: ["common",'index'],
        }),

        new ParallelUglifyPlugin({
            // 传递给 UglifyJS的参数如下：
            uglifyJS: {
                output: {
                    /*
                     是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，
                     可以设置为false
                    */
                    beautify: false,
                    /*
                     是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
                    */
                    comments: false
                },
                compress: {
                    /*
                     是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用
                     不大的警告
                    */
                    warnings: false,

                    /*
                     是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
                    */
                    drop_console: true,

                    /*
                     是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不
                     转换，为了达到更好的压缩效果，可以设置为false
                    */
                    collapse_vars: true,

                    /*
                     是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成
                     var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
                    */
                    reduce_vars: true
                }
            }
        })

    );



    return webpackConfig;
};

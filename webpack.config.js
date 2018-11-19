const webpack = require('atool-build/lib/webpack');
const path = require('path');  //引入path模块
// const UglifyJSPlugin = require('atool-build/node_modules/webpack/lib/optimize/UglifyJsPlugin')
var HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function (webpackConfig, env) {
    webpackConfig.babel.plugins.push('transform-runtime');
    webpackConfig.babel.plugins.push(['import', {
        libraryName: 'antd',
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

    /**
     * js代码压缩
     * 使用webpack自带Uglify插件
     * 加入了这个插件之后，编译的速度会明显变慢
     */
    // webpackConfig.plugins.push(
    //     new UglifyJSPlugin({
    //         mangle: {
    //             except: ['$super', '$', 'exports', 'require', 'module', '_']
    //         },
    //         output: {
    //             // 是否输出可读性较强的代码，即会保留空格和制表符，默认为是，为了达到更好的压缩效果，可以设置为 false。
    //             beautify: false,
    //             // 是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为 false。
    //             comments: false,
    //         },
    //         compress: {
    //             // 是否剔除代码中所有的  console  语句，默认为不剔除。开启后不仅可以提升代码压缩效果，也可以兼容不支持 console 语句 IE 浏览器。
    //             drop_console: true,
    //             // 是否内嵌定义了但是只用到一次的变量，例如把 var x = 5; y = x 转换成 y = 5，默认为不转换。为了达到更好的压缩效果，可以设置为 false。
    //             collapse_vars: false
    //         }
    //     })
    // )

    // Support CSS Modules
    // Parse all less files as css module.
    webpackConfig.module.loaders.forEach(function (loader, index) {
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

    //抽取CSS文件插件
    new ExtractTextPlugin({filename: '[name].css', allChunks: true}),

    new HtmlWebpackPlugin({
        title: "HtmlPlugin",
        // filename :"index.html",
        template: path.join(__dirname, "./src/index.html"),
        // template:(useDefinedHtml ? useDefinedHtml : defaultHtml),
        //we must use html-loader here instead of file-loader
        inject: "body",
        cache: false,
        xhtml: false
    })

    return webpackConfig;
};

const webpack = require('atool-build/lib/webpack');

module.exports = function(webpackConfig, env) {
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
  webpackConfig.plugins = webpackConfig.plugins.filter(function(plugin) {
    return !(plugin instanceof webpack.optimize.CommonsChunkPlugin);
  });

  // Support CSS Modules
  // Parse all less files as css module.
  webpackConfig.module.loaders.forEach(function(loader, index) {
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

  return webpackConfig;
};

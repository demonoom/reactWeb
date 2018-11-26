'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var babel = require('babel-core');

var noop = function noop() {
  return null;
};

var jsCompiler = function jsCompiler(ext) {
  var origJs = require.extensions[ext];
  return function (module, filename) {
    if (filename.indexOf('node_modules/') >= 0) {
      return (origJs || require.extensions[ext])(module, filename);
    }

    var content = _fs2.default.readFileSync(filename, 'utf-8');
    var code = babel.transform(content, {
      presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-react'), require.resolve('babel-preset-stage-0')],
      plugins: [require.resolve('babel-plugin-add-module-exports')],
      ast: false
    }).code;

    return module._compile(code, filename);
  };
};

require.extensions['.js'] = jsCompiler('.js');
require.extensions['.jsx'] = jsCompiler('.jsx');

require.extensions['.css'] = noop;
require.extensions['.less'] = noop;
require.extensions['.scss'] = noop;
require.extensions['.sass'] = noop;

require.extensions['.html'] = noop;
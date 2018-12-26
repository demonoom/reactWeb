'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactRouter = require('react-router');

var _reactRouterRedux = require('react-router-redux');

var _createDva = require('./createDva');

var _createDva2 = _interopRequireDefault(_createDva);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createDva2.default)({
  mobile: false,
  initialReducer: {
    routing: _reactRouterRedux.routerReducer
  },
  defaultHistory: _reactRouter.hashHistory,
  routerMiddleware: _reactRouterRedux.routerMiddleware,

  setupHistory: function setupHistory(history) {
    this._history = (0, _reactRouterRedux.syncHistoryWithStore)(history, this._store);
  }
});
module.exports = exports['default'];
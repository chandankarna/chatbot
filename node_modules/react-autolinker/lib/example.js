'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDomServer = require('react-dom/server');

var _reactDomServer2 = _interopRequireDefault(_reactDomServer);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var text = '\nFoo http://google.com bar http:/twitter.com baz http//google.com\n';

console.log(_reactDomServer2['default'].renderToString(_react2['default'].createElement(_index2['default'], { text: text })));
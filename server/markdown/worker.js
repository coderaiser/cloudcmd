'use strict';

const markdownIt = require('markdown-it')();
module.exports = (a) => markdownIt.render(a);

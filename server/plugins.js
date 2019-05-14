'use strict';

const {deprecate} = require('util');
const currify = require('currify');
const {readPipe} = require('files-io');

module.exports = currify((plugins, req, res, next) => {
    if (req.url !== '/plugins.js')
        return next();
    
    res.setHeader('content-type', 'application/javascript; charset=utf-8');
    
    if (!plugins || !plugins.length)
        return res.send('');
    
    readPlugin(plugins, res);
});

const readPlugin = deprecate((plugins, res) => {
    readPipe(plugins, res).catch((e) => {
        res.end(e.message);
    });
}, 'plugins deprecated. Use user menu instead', 'DEP0001');


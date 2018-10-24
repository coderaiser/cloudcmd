'use strict';

const currify = require('currify');
const files = require('files-io');

module.exports = currify((plugins, req, res, next) => {
    if (req.url !== '/plugins.js')
        return next();
    
    if (!plugins || !plugins.length)
        return res.send('');
    
    files.readPipe(plugins, res).catch((e) => {
        res.end(e.message);
    });
});


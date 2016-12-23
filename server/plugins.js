'use strict';

const currify = require('currify/legacy');
const files = require('files-io');

module.exports = currify((plugins, req, res, next) => {
    if (req.url !== '/plugins.js')
        return next();
    
    if (!plugins || !plugins.length)
        return res.send('');
    
    files.readPipe(plugins, res, (e) => {
        if (!e)
            return;
        
        res.end(e.message);
    });
});


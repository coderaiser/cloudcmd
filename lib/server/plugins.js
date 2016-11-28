'use strict';

var currify = require('currify/legacy');
var files = require('files-io');

module.exports = currify(function(plugins, req, res, next) {
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


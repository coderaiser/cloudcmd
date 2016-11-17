'use strict';

var exit = require('./exit');

module.exports.root = root;
module.exports.editor = editor;
module.exports.packer = packer;

function root(dir, fn) {
    var fs;
    
    if (dir !== '/') {
        fs  = require('fs');
        fs.stat(dir, function(error) {
            if (error)
                exit('cloudcmd --root: %s', error.message);
            else if (typeof fn === 'function')
                fn('root:', dir);
        });
    }
}

function editor(name) {
    var reg = /^(dword|edward|deepword)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --editor: could be "dword", "edward" or "deepword" only');
}

function packer(name) {
    var reg = /^(tar|zip)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --packer: could be "tar" or "zip" only');
}


(function() {
    'use strict';
    
    var fs      = require('fs'),
        path    = require('path'),
        Util    = require('../util');
    
    module.exports = function(card, callback) {
        var dir         = path.dirname(card),
            nameCard    = path.basename(card),
            regExp      = Util.getRegExp(nameCard);
        
        if (!callback)
            throw(Error('Callback is absent!'));
        
        fs.readdir(dir, function(error, names) {
            var result;
            
            if (!error)
                names.some(function(name) {
                    var is = name.match(regExp);
                    
                    if (is)
                        result = name;
                    
                    return is;
                });
            
            if (result)
                result = path.join(dir, result);
            
            callback(error, result);
        });
    };
})();

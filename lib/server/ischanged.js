(function() {
    'use strict';
    
    var 
        DIR_JSON        = __dirname + '/../../json/',
        
        fs              = require('fs'),
        Util            = require('../util'),
        time            = require('./timem'),
        
        NAME_SHORT      = DIR_JSON + 'changes',
        NAME            = NAME_SHORT + '.json',
        
        Times           = {};
        
        Util.exec.try(function() {
            Times = require(NAME_SHORT);
        });
        
    module.exports = function(name, callback) {
        var readTime = Times[name];
        
        Util.checkArgs(arguments, ['name', 'callback']);
        
        time.get(name, 'raw', function(error, fileTime) {
            var json, timeChanged;
            
            if (!error && readTime !== fileTime) {
                timeChanged     = true;
                Times[name]     = fileTime;
                json            = Util.stringifyJSON(Times);
                
                fs.writeFile(NAME, json, function(error) {
                    if (error)
                        Util.log(error);
                });
            }
            
            callback(error, timeChanged);
        });
    };
})();

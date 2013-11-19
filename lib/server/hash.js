(function (object) {
    'use strict';
    
    var util        = require('util'),
        Writable    = require('stream').Writable;
        
    util.inherits(HashProto, Writable);
    
    object.Hash         = new HashProto();
     
    function HashProto() {
        var shasum,
            crypto      = require('crypto');
        
        this.create = function() {
            var ws      = new Writable();
            
            ws._write   = write;
            ws.get      = get;
            
            shasum      = crypto.createHash('sha1');
            
            return ws;
        };
        
        function get() {
            var hex = shasum.digest('hex');
            
            return hex;
        }
        
        function write (chunk, enc, next) {
            shasum.update(chunk);
            next();
        }
    }
    
})(this);

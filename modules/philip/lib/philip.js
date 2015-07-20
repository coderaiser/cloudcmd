/* global Emitify */
/* global findit */
/* global exec */

(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = Philip;
    else
        global.philip   = Philip;
    
    Philip.prototype = Object.create(Emitify.prototype);
    
    function Philip(entries, processingFn) {
        var array,
            self;
        
        if (!(this instanceof Philip))
            return new Philip(entries, processingFn);
        
        if (typeof processingFn !== 'function')
            throw Error('processingFn should be function!');
        
        Emitify.call(this);
        
        if (Array.isArray(entries))
            array = entries;
        else
            array = [entries];
        
        self    = this;
        
        this._i             = 0;
        this._n             = 0;
        this._processingFn  = processingFn;
        this._pause         = false;
        this._prev          = 0;
        
        this._find(array, function(files, dirs) {
            self._files = files;
            self._dirs  = dirs;
            self._n     = files.length + dirs.length;
            self._data  = {};
            
            self._getFiles(files, self._data, function() {
                self._process();
            });
        });
    }
    
    Philip.prototype._process    = function() {
        var args,
            argsLength  = this._processingFn.length,
            el,
            data,
            self        = this,
            name        = self._dirs.shift(),
            type        = 'directory',
            fn          = function(error) {
                ++self._i;
                
                if (error) {
                    self.emit('error', error);
                    self.pause();
                }
                
                self._process();
                self._progress();
            };
        
        if (!name) {
            type    = 'file';
            el      = self._files.shift();
            
            if (el) {
                name    = el.fullPath;
                data    = self._data[name];
            }
        }
        
        if (!name) {
            self.emit('end');
        } else if (!this._pause) {
            switch(argsLength) {
            default:
                args = [type, name, data];
                break;
            
            case 6:
                args = [type, name, data, this._i, this._n];
                break;
            }
            
            args.push(fn);
            
            self._processingFn.apply(null, args);
        }
    };
    
    Philip.prototype.pause      = function() {
        this._pause = true;
    };
    
    Philip.prototype.continue   = function() {
        if (this._pause) {
            this._pause = false;
            this._process();
        }
    };
    
    Philip.prototype.abort   = function() {
        this._files = [];
        this._dirs  = [];
        
        this._process();
    };
    
    Philip.prototype._progress  = function() {
        var value = Math.round(this._i * 100 / this._n);
        
        if (value !== this._prev) {
            this._prev = value;
            this.emit('progress', value);
        }
    };
    
    Philip.prototype._getFiles = function(files, obj, callback) {
        var current,
            self    = this;
        
        files   = files.slice();
        current = files.shift();
        
        if (!obj)
            obj = {};
        
        if (!current)
            callback(null, obj);
        else
            current.file(function(file) {
                var name    = current.fullPath;
                
                obj[name]   = file;
                
                self._getFiles(files, obj, callback);
            });
    };
    
    Philip.prototype._find = function(entries, fn) {
        var files   = [],
            dirs    = [];
        
        exec.each(entries, function(entry, callback) {
            var finder  = findit(entry);
            
            finder.on('directory', function(name) {
                dirs.push(name);
            });
            
            finder.on('file', function(name, current) {
                files.push(current);
            });
            
            finder.on('end', function() {
                callback();
            });
        }, function() {
            fn(files, dirs);
        });
    };
})(this);

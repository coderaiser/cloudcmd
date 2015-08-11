/* global CloudCmd */
/* global DOM */

(function() {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports      = uploadDirectory;
    else
        DOM.uploadDirectory = uploadDirectory;
    
    function uploadDirectory(items) {
        var entries,
            Images  = DOM.Images,
            Info    = DOM.CurrentInfo,
            load    = DOM.load,
            url     = '',
            array   = [
                'findit',
                'philip'
            ];
        
        if (entries.length)
            Images.show('top');
        
        entries     = [].map.call(items, function(item) {
            return item.webkitGetAsEntry();
        });
        
        if (!window.Emitify)
            array.unshift('emitify');
        
        array = array.map(function(name) {
            var result = [
                '/modules/' + name,
                '/lib/' + name,
                '.js'
            ].join('');
            
            return result;
        });
        
        if (!window.exec)
            array.unshift('/modules/execon/lib/exec.js');
        
        url = CloudCmd.join(array);
        
        load.js(url, function() {
            var path        = Info.dirPath
                .replace(/\/$/, ''),
                
                uploader;
            
            uploader = window.philip(entries, function(type, name, data, i, n, callback) {
                var upload,
                    full = path + name;
                
                switch(type) {
                case 'file':
                    upload = uploadFile(full, data);
                    break;
                
                case 'directory':
                    upload = uploadDir(full);
                    break;
                }
                
                upload.on('end', callback);
                
                upload.on('progress', function(count) {
                    var current = percent(i, n),
                        next    = percent(i + 1, n),
                        max     = next - current,
                        value   = current + percent(count, 100, max);
                    
                    setProgress(value);
                });
            });
            
            uploader.on('error', function(error) {
                alert(error);
                uploader.abort();
            });
            
            uploader.on('progress', function(count) {
                setProgress(count);
            });
            
            uploader.on('end', function() {
                CloudCmd.refresh();
            });
        });
    }
    
    function percent(i, n, per) {
        var value;
        
        if (!per)
            per = 100;
        
        value = Math.round(i * per / n);
        
        return value;
    }
    
    function setProgress(count) {
        var Images  = DOM.Images;
        
        Images.setProgress(count);
        Images.show('top');
    }
    
    function uploadFile(url, data, callback) {
        return DOM.load.put(url, data, callback);
    }
    
    function uploadDir(url, callback) {
        return DOM.load.put(url + '?dir', null, callback);
    }
    
})();

/* global CloudCmd */
/* global DOM */
/* global CloudFunc */

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
            
            uploader = window.philip(entries, function(type, name, data, callback) {
                var full = path + name;
                switch(type) {
                case 'file':
                    uploadFile(full, data, callback);
                    break;
                
                case 'directory':
                    uploadDir(full, callback);
                    break;
                }
            });
            
            uploader.on('error', function(error) {
                alert(error);
                uploader.abort();
            });
            
            uploader.on('progress', function(count) {
                Images.setProgress(count);
                Images.show('top');
            });
            
            uploader.on('end', function() {
                CloudCmd.refresh();
            });
        });
    }
    
    function uploadFile(url, data, callback) {
        upload(url, data, callback);
    }
    
    function uploadDir(url, callback) {
         upload(url + '?dir', null, callback);
    }
    
    function upload(url, body, callback) {
        var prefix  = CloudCmd.PREFIX,
            apiURL  = prefix + CloudFunc.apiURL,
            api     = apiURL + '/fs',
            xhr     = new XMLHttpRequest();
        
        url     = encodeURI(url);
        url     = url.replace('#', '%23');
        
        xhr.open('put', api + url, true);
        xhr.onreadystatechange = function() {
            var error,
                over    = xhr.readyState === 4,
                OK      = 200;
            
            if (over) {
                if (xhr.status !== OK)
                    error = Error(xhr.responseText);
                
                callback(error);
            }
        };
        xhr.send(body);
    }
    
})();

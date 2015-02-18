var CloudCmd;

(function() {
    'use strict';
    
    CloudCmd = load;
    
    function load(prefix) {
        var urlFiles,
            modules = '/modules/',
            lib     = 'lib/',
            client  = 'client/',
            files   = [
                'util',
                'join',
                'cloudfunc',
                client  + 'dom',
                client  + 'events',
                client  + 'rest',
                client  + 'load',
                client  + 'notify',
                client  + 'storage',
                client  + 'files',
                client  + 'buffer',
                'client',
                client  + 'listeners',
                client  + 'key'
            ].map(function(name) {
               return lib + name;
            });
        
        files.unshift(modules + 'promise-polyfill/Promise');
        files.unshift(modules + 'format-io/lib/format');
        
        files = files.map(function(name) {
            return name + '.js';
        });
        
        urlFiles     = getJoinURL(files);
        
        if (!prefix)
            prefix = '/cloudcmd';
        
        createScript(prefix + urlFiles, function() {
            CloudCmd.init(prefix);
        });
        
        window.removeEventListener('load', load);
    }
        
    function createScript(url, callback) {
        var script      = document.createElement('script');
        
        script.src      = url;
        script.async    = true;
        
        if (callback)
            script.addEventListener('load', function(event) {
                callback(event);
                script.removeEventListener('load', callback);
            });
        
        document.body.appendChild(script);
    }
        
    function getJoinURL(names) {
        var prefix  = '/join:',
            url     = prefix + names.join(':');
        
        return url;
    }
})();

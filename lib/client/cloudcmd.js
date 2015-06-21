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
                'cloudfunc',
                client  + 'dom',
                client  + 'events',
                client  + 'rest',
                client  + 'load',
                client  + 'notify',
                client  + 'storage',
                client  + 'files',
                'client',
                client  + 'buffer',
                client  + 'listeners',
                client  + 'key'
            ].map(function(name) {
               return lib + name;
            }),
            
            moduleFiles = [
                'promise-polyfill/Promise',
                'domtokenlist-shim/dist/domtokenlist',
                'format-io/lib/format',
                'rendy/lib/rendy',
            ].map(function(name) {
                 return modules + name;
            });
        
        files = moduleFiles
            .concat(files)
            .concat('/join/join')
            .map(function(name) {
                return name + '.js';
            });
        
        urlFiles     = getJoinURL(files);
        
        if (!prefix)
            prefix = '';
        
        createScript(prefix + urlFiles, function() {
            CloudCmd.init(prefix);
        });
    }
        
    function createScript(url, callback) {
        var script      = document.createElement('script');
        
        script.src      = url;
        script.async    = true;
        
        script.addEventListener('load', function load(event) {
            callback(event);
            script.removeEventListener('load', load);
        });
        
        document.body.appendChild(script);
    }
        
    function getJoinURL(names) {
        var prefix  = '/join:',
            url     = prefix + names.join(':');
        
        return url;
    }
})();

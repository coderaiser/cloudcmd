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
                client  + 'dialog',
                'client',
                client  + 'buffer',
                client  + 'listeners',
                client  + 'key',
                client  + 'directory'
            ].map(function(name) {
               return lib + name;
            }),
            
            moduleFiles = [
                window.Promise ? '' : 'promise-polyfill/Promise.min',
                libDir('format', 'format-io'),
                libDir('rendy'),
                libDir('emitify', '', 'dist'),
                libDir('exec', 'execon')
            ].filter(function(name) {
                return name;
            }).map(function(name) {
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
    
    function libDir(name, dir, libDir) {
        var lib;
        
        if (!dir)
            dir = name;
        
        if (libDir)
            lib = '/' + libDir + '/';
        else
            lib = '/lib/';
        
        return dir + lib + name;
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

var CloudCmd;

(function() {
    'use strict';
    
    CloudCmd = load;
    
    function load(prefix) {
        prefix = prefix || '';
        
        var modules = '/modules/';
        var client  = 'client/';
        var files   = [
            'common/util',
            'common/cloudfunc',
            client  + 'dom',
            client  + 'events',
            client  + 'rest',
            client  + 'load',
            client  + 'notify',
            client  + 'storage',
            client  + 'files',
            client  + 'dialog',
            'client/client',
            client  + 'buffer',
            client  + 'listeners',
            client  + 'key',
            client  + 'directory'
        ];
        
        var moduleFiles = [
            window.Promise ? '' : 'promise-polyfill/promise.min',
            libDir('format', 'format-io'),
            libDir('rendy'),
            libDir('exec', 'execon'),
            libDir('jonny'),
            libDist('emitify'),
            libDist('currify'),
        ].filter(function(name) {
            return name;
        }).map(function(name) {
             return modules + name;
        });
        
        var allFiles = moduleFiles
            .concat(files)
            .concat('/join/join')
            .map(function(name) {
                return name + '.js';
            });
        
        var urlFiles = getJoinURL(allFiles);
        
        createScript(prefix + urlFiles, function() {
            CloudCmd.init(prefix);
        });
    }
    
    function libDir(name, dir) {
        var lib = '/lib/';
        
        if (!dir)
            dir = name;
        
        return dir + lib + name;
    }
    
    function libDist(name) {
        return name + '/dist/' + name + '.min';
    }
    
    function createScript(url, callback) {
        var script = document.createElement('script');
        
        script.src = url;
        script.async = true;
        
        script.addEventListener('load', function load(event) {
            callback(event);
            script.removeEventListener('load', load);
        });
        
        document.body.appendChild(script);
    }
        
    function getJoinURL(names) {
        var prefix = '/join:';
        var url = prefix + names.join(':');
        
        return url;
    }
})();


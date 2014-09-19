var CloudCmd;

(function() {
    CloudCmd = load;
    
    function load() {
        var lib     = 'lib/',
            client  = 'client/',
            files   = [
                'util',
                'join',
                'format',
                'promise',
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
               return lib + name + '.js';
            }),
            
            urlFiles     = getJoinURL(files);
        
        createScript(urlFiles, function() {
            CloudCmd.init();
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

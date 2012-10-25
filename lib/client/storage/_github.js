var CloudCommander;

var CloudCommander, Github;
/* object contains terminal jqconsole */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,    
        Util                            = cloudcmd.Util;
        
    cloudcmd.Storage                    = {};
    
    var GithubStore                     = {};
        
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads github.js
     */
    function load(){
        console.time('github load');
        
        var lDir = './lib/client/storage/github/';
        Util.anyLoadOnLoad([
            lDir + 'github.js',
            lDir + 'lib/base64.js',
            lDir + 'lib/underscore.js'],
            
            function(){
                console.timeEnd('github load');
                Util.Images.hideLoad();
        });
    }
    
    function callback(pError, pDate){
        if(pError)
            console.log(pError);
        
        if(pDate)
            console.log(pDate);
    }
    
    GithubStore.login                  = function(pUser, pPasswd){
        cloudcmd.Storage.Github = new Github({
            username: pUser,
            password: pPasswd,
            auth    : 'oauth'
        });
    };
    /* PUBLICK FUNCTIONS */
                
    /**
     * function bind keys
     */
    cloudcmd.Storage.Keys              = function(){
        load();
    };
    
    cloudcmd.Storage.Github    = GithubStore;
    
})();
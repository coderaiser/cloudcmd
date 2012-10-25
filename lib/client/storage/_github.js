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
                init();
        });
    }
    
    function callback(pError, pDate){
        if(pError)
            console.log(pError);
        
        if(pDate)
            console.log(pDate);
    }
    
    /* PUBLICK FUNCTIONS */
    GithubStore.basicLogin                  = function(pUser, pPasswd){
        cloudcmd.Storage.Github = new Github({
            username: pUser,
            password: pPasswd,
            auth    : 'basic'
        });
    };
    
    GithubStore.Login                  = function(pToken){
        cloudcmd.Storage.Github = new Github({
            token   : pToken,
            auth    : 'oauth'
        });
    };    

    function init(){
        var lTokin = window.location.search;
        if ( Util.isContainStr(lTokin, '?code=') )
            lTokin = lTokin.replace('?code=','');
        
        GithubStore.Login(lTokin);
    }
    
    cloudcmd.Auth                   = function(){
        window.location = 
            'https://github.com/login/oauth/authorize?client_id=' + 
            '891c251b925e4e967fa9';        
    };

    cloudcmd.Storage.Keys              = function(){        
        load();
    };
    
    cloudcmd.Storage.Github    = GithubStore;
    
})();
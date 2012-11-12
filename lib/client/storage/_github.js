var CloudCommander, $, Github;
/* module for work with github */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,    
        Util                            = cloudcmd.Util,
        
        CLIENT_ID                       = '891c251b925e4e967fa9',
        CLIENT_SECRET                   = 'afe9bed1e810c5dc44c4c2a953fc6efb1e5b0545',
        GithubStore                     = {};
        
    cloudcmd.Storage                    = {};
        
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads github.js
     */
    function load(){
        console.time('github load');
        
        var lDir = './lib/client/storage/github/';
        DOM.anyLoadOnLoad([
            lDir + 'github.js',
            lDir + 'lib/base64.js',
            lDir + 'lib/underscore.js'],
            
            function(){
                console.timeEnd('github load');
                DOM.Images.hideLoad();
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
        var lCode = window.location.search;
        if ( Util.isContainStr(lCode, '?code=') ){
            lCode = lCode.replace('?code=','');
            
            $.post("https://github.com/login/oauth/access_token",{
                    client_id       : CLIENT_ID,
                    client_secret   : CLIENT_SECRET,
                    code            : lCode,
                    state           : ''
                },
                
                function(pDate){
                    //GithubStore.Login(lToken);
                    console.log(pDate);
                }, "json");
            }
        else
            cloudcmd.Auth();
    }
    
    cloudcmd.Auth                   = function(){
        window.location = 
            'https://github.com/login/oauth/authorize?client_id=' + 
            CLIENT_ID + '&&scope=repo,user,gist';
    };

    cloudcmd.Storage.Keys              = function(){        
        DOM.jqueryLoad( load );
    };
    
    cloudcmd.Storage.Github    = GithubStore;    
})();

var CloudCommander, Util, DOM, $, Github;
/* module for work with github */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        
        CLIENT_ID,    //                   = '891c251b925e4e967fa9',
        CLIENT_SECRET,//                   = 'afe9bed1e810c5dc44c4c2a953fc6efb1e5b0545',
        GithubStore                     = {};
        
    cloudcmd.Storage                    = {};
        
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads github.js
     */
    function load(pCallBack){
        console.time('github load');
        
        var lDir = './lib/client/storage/github/';
        DOM.anyLoadOnLoad([
            lDir + 'github.js',
            lDir + 'lib/base64.js',
            lDir + 'lib/underscore.js'],
            
            function(){
                console.timeEnd('github load');
                DOM.Images.hideLoad();
                
                Util.exec(pCallBack);
        });
    }
    
    function setConfig(pCallBack){
        cloudcmd.loadConfig(function(){
            var lConfig     = cloudcmd.Config;
            CLIENT_ID       = lConfig.oauth_client_id;
            CLIENT_SECRET   = lConfig.oauth_client_secret;
            
            Util.exec(pCallBack);
        });
    }
    
    function callback(pError, pData){
        console.log(pError || pData);
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
            
            $.ajax({
                type:'put',
                url:'/api/v1/auth',
                data: lCode,
                success: function(pData){
                    var lToken = pData.token;
                    
                    if(pData){
                        GithubStore.Login(lToken);
                        
                        getUserData(lToken);
                    }
                }
            });
            
            /*
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
                */
            }
        else
            cloudcmd.Auth();
    }
    
    cloudcmd.Auth                   = function(){
        window.location = 
            'https://github.com/login/oauth/authorize?client_id=' + 
            CLIENT_ID + '&&scope=repo,user,gist';
    };

    function getUserData(pToken){
        var lHelloFunc = function(pData){
            var lName;
            if(pData)
                lName = ' ' + pData.name ;
            
            console.log('Hello' + lName + ' :)!');
        };
        
        if(pToken)
            $.ajax({
                url     : 'https://api.github.com/user?access_token=' + pToken,
                success : lHelloFunc
            });
        else
            lHelloFunc();
    }

    cloudcmd.Storage.Keys              = function(){
        DOM.jqueryLoad( Util.retLoadOnLoad([
            init,
            setConfig,
            load
        ]));        
    };
    
    cloudcmd.Storage.Github    = GithubStore;
})();

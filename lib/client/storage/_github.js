var CloudCommander, Util, DOM, $, Github, cb;
    /* temporary callback function for work with github */
/* module for work with github */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        
        API_URL                         = '/api/v1/auth',
        CLIENT_ID,
        Cache                           = DOM.Cache,
        GitHub,
        User,
        GithubStore                     = {};
        
    cloudcmd.Storage                    = {};
    
    cb = function (err, data){ console.log(err || data);}
    
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
            
            Util.exec(pCallBack);
        });
    }
    
    function saveToken(pToken){
        return Cache.set('token', pToken);
    }
    
    function getToken(){
        return Cache.get('token');
    }
    
    
    /* PUBLICK FUNCTIONS */
    GithubStore.basicLogin                  = function(pUser, pPasswd){
        cloudcmd.Storage.Github = GitHub = new Github({
            username: pUser,
            password: pPasswd,
            auth    : 'basic'
        });
    };
    
    GithubStore.Login                  = function(pToken){
        cloudcmd.Storage.Github = Github = new Github({
            token   : pToken,
            auth    : 'oauth'
        });
        
        User = Github.getUser();
    };

    function init(pCallBack){
        var lToken = getToken();
        if(lToken){
            GithubStore.Login(lToken);
            Util.exec(pCallBack);
        }
        else{
            var lCode = window.location.search;
            if ( Util.isContainStr(lCode, '?code=') ){
                lCode = lCode.replace('?code=','');
                
                DOM.ajax({
                    type    : 'put',
                    url     : API_URL,
                    data: lCode,
                    success: function(pData){
                        if(pData && pData.token){
                            lToken = pData.token;
                            
                            GithubStore.Login(lToken);
                            saveToken(lToken);
                            Util.exec(pCallBack);
                        }
                        else
                            Util.log("Worning: token not getted...");
                    }
                });
            }
            else
                window.location = 
                    'https://github.com/login/oauth/authorize?client_id=' + 
                    CLIENT_ID + '&&scope=repo,user,gist';
        }
    }

    function getUserData(){
        var lShowRepos = function(pError, pRepos){
                Util.log('Repositories: ');
                if(!pError)
                    for(var i = 0, n = pRepos.length; i < n ; i++)
                        console.log(pRepos[i].name);
                else
                    DOM.Cache.remove('token');
            },
        
            lShowUserInfo =  function(pError, pData){
                if(!pError){
                    console.log('Hello ' + pData.name + ' :)!');
                    User.repos(lShowRepos);
                }
                else
                    DOM.Cache.remove('token');
            };
        
        
        User.show(null, lShowUserInfo);
    }

    cloudcmd.Storage.Keys              = function(){
        Util.loadOnLoad([
            getUserData,
            init,
            setConfig,
            load
        ]);
    };
    
    cloudcmd.Storage.GithubStore    = GithubStore;
})();

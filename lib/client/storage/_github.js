var CloudCommander, Util, DOM, $, Github, cb;
/* module for work with github */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        
        APIURL                          = '/api/v1',
        AuthURL                         = APIURL + '/auth',
        ClientIdURL                     = APIURL + '/client_id',
        CLIENT_ID,
        Cache                           = DOM.Cache,
        GithubLocal,
        User,
        GithubStore                     = {};
        
    cloudcmd.Storage                    = {};
    
    /* temporary callback function for work with github */
    cb = function (err, data){ console.log(err || data);};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads github.js
     */
    function load(pCallBack){
        console.time('github load');
        
        var lDir    = './lib/client/storage/github/',
            lFiles  =  [
                lDir + 'github.js',
                lDir + 'lib/base64.js',
                lDir + 'lib/underscore.js'
            ];
        
        DOM.anyLoadInParallel(lFiles, function(){
            console.timeEnd('github load');
            DOM.Images.hideLoad();
          
            Util.exec(pCallBack);
          });
    }
    
    function setConfig(pCallBack){
       
        DOM.ajax({
            url     : ClientIdURL,
            success : function(pData){
                CLIENT_ID       = pData;
                Util.exec(pCallBack);
            }
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
        cloudcmd.Storage.Github = GithubLocal = new Github({
            username: pUser,
            password: pPasswd,
            auth    : 'basic'
        });
    };
    
    GithubStore.Login                  = function(pToken){
        cloudcmd.Storage.Github = Github = GithubLocal = new Github({
            token   : pToken,
            auth    : 'oauth'
        });
        
        User = GithubLocal.getUser();
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
                    url     : AuthURL,
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
            //window.open('welcome.html', 'welcome','width=300,height=200,menubar=yes,status=yes')">
                window.location = 
                    'https://github.com/login/oauth/authorize?client_id=' + 
                    CLIENT_ID + '&&scope=repo,user,gist';
        }
    }
    
    function getUserData(){
        var lName, lRepoNames,
            lGetTree    = function(pError ,pData){
                Util.log('Tree of ripository ' + lRepoNames[0].name + ': ');
                var lTree = pData || [];
                if(!pError)
                    for(var i = 0, n = lTree.length; i < n ; i++)
                        if( !Util.isContainStr(lTree[i].path, '/') )
                            console.log(lTree[i].path);
                else
                    Util.log(pError);
            },
            
            lShowRepos = function(pError, pRepos){
                lRepoNames = pRepos || [];
                Util.log('Repositories: ');
                if(!pError){
                    for(var i = 0, n = pRepos.length; i < n ; i++)
                        console.log(pRepos[i].name);
                        
                    var lRepo = GithubLocal.getRepo(lName, pRepos[0].name);
                    lRepo.getTree('master?recursive=true', lGetTree);
                }
                else
                    DOM.Cache.remove('token');
            },
        
            lShowUserInfo =  function(pError, pData){
                if(!pError){
                    lName  = pData.name;
                    
                    console.log('Hello ' + lName + ' :)!');
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

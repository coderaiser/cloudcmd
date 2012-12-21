var CloudCommander, Util, DOM, $, Github, cb;
/* module for work with github */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        Cache                           = DOM.Cache,
        
        APIURL,
        AuthURL,
        
        GitHub_ID,
        GithubLocal,
        User,
        GithubStore                     = {};
    
    /* temporary callback function for work with github */
    cb = function (err, data){ console.log(err || data);};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads github.js
     */
    function load(pCallBack){
        console.time('github load');
        
        var lDir    = '/lib/client/storage/github/',
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
        cloudcmd.getConfig(function(pConfig){
            GitHub_ID       = pConfig.github_key;
            APIURL          = pConfig.api_url;
            AuthURL         = APIURL + '/auth';
            
            Util.exec(pCallBack);
        });
    }
    
    
    GithubStore.init            = function(pCallBack, pCode){
        var lToken = Cache.get('token');
        if(lToken){
            GithubStore.Login(lToken);
            Util.exec(pCallBack);
        }
        else{
            var lCode = pCode || window.location.search;
            if (pCode || Util.isContainStr(lCode, '?code=') ){
                lCode = lCode.replace('?code=','');
                
                var lSuccess = function(pData){
                        if(pData && pData.token){
                            lToken = pData.token;
                            
                            GithubStore.Login(lToken);
                            Cache.set('token', lToken);
                            Util.exec(pCallBack);
                        }
                        else
                            Util.log('Worning: token not getted...');
                    },
                    lData   = {
                        type    : 'put',
                        url     : AuthURL,
                        data    : lCode,
                        success : lSuccess
                    };
                
                DOM.ajax(lData);
            }
            else{
                var lUrl = '//' + window.location.host + '/auth/github';
                DOM.openWindow(lUrl);
            }
        }
    };
    
    GithubStore.getUserData     = function(pCallBack){
        var lName,
            
            lShowUserInfo =  function(pError, pData){
                if(!pError){
                    lName  = pData.name;
                    
                    console.log('Hello ' + lName + ' :)!');
                }
                else
                    DOM.Cache.remove('token');
            };
            
        User.show(null, lShowUserInfo);
        
        Util.exec(pCallBack);
    }
    
    /* PUBLIC FUNCTIONS */
    GithubStore.basicLogin          = function(pUser, pPasswd){
        GithubLocal = new Github({
            username: pUser,
            password: pPasswd,
            auth    : 'basic'
        });
    };
    
    GithubStore.Login               = function(pToken){
        Github = GithubLocal = new Github({
            token   : pToken,
            auth    : 'oauth'
        });
        
        User = GithubLocal.getUser();
    };
    
    /**
     * function creates gist
     */
    cloudcmd.GitHub.uploadFile      = function(pParams, pCallBack){
        var lContent    = pParams.data,
            lName       = pParams.name;
        
        if(lContent){
            DOM.Images.showLoad();
            if(!lName)
                lName = Util.getDate();
            
            var lGist       = GithubLocal.getGist(),
                lFiles      = {},
                lHost       = CloudCommander.HOST,
                lOptions    = {
                    description: 'Uplouded by Cloud Commander from ' + lHost,
                    
                    public: true
                };
            
            lFiles[lName] ={
                content: lContent
            };
            
            lOptions.files = lFiles;
            
            lGist.create(lOptions, function(pError, pData){
                DOM.Images.hideLoad();
                console.log(pError || pData);
                console.log(pData && pData.html_url);
                
                Util.exec(pCallBack);
            });
        }
        
        return lContent;
    };
    
    cloudcmd.GitHub.init            = function(pCallBack){
        Util.loadOnLoad([
            Util.retExec(pCallBack),
            GithubStore.getUserData,
            GithubStore.init,
            setConfig,
            load
        ]);
        
        cloudcmd.GitHub.init = null;
    };
    
    cloudcmd.Github                 = GithubStore;
})();

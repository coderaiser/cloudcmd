var CloudCmd, Util, DOM, $, Github, cb;
/* module for work with github */

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var Storage                         = DOM.Storage,
        GithubLocal,
        User,
        GitHubStore                     = {};
    
    /* temporary callback function for work with github */
    cb = function (err, data){ Util.log(err || data);};
    
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
    
    
    GitHubStore.autorize            = function(pCallBack, pCode){
        var lToken = Storage.get('token');
        if(lToken){
            GitHubStore.Login(lToken);
            Util.exec(pCallBack);
        }
        else{
            var lCode = pCode || window.location.search;
            if (lCode || Util.isContainStr(lCode, '?code=') )
                CloudCmd.getConfig(function(pConfig){
                    DOM.ajax({
                        type    : 'put',
                        url     : pConfig && pConfig.api_url + '/auth',
                        data    : Util.removeStr(lCode, '?code='),
                        success : function(pData){
                            if(pData && pData.token){
                                lToken = pData.token;
                                
                                GitHubStore.Login(lToken);
                                Storage.set('token', lToken);
                                Util.exec(pCallBack);
                            }
                            else
                                Util.log('Worning: token not getted...');
                        }
                    });
                });
            else{
                var lUrl = '//' + window.location.host + '/auth/github';
                DOM.openWindow(lUrl);
            }
        }
    };
    
    GitHubStore.getUserData         = function(pCallBack){            
        User.show(null, function(pError, pData){
            if(!pError){
                var lName  = pData.name;
                Util.log('Hello ' + lName + ' :)!');
            }
            else
                DOM.Storage.remove('token');
        });
        
        Util.exec(pCallBack);
    };
    
    /* PUBLIC FUNCTIONS */
    GitHubStore.basicLogin          = function(pUser, pPasswd){
        GithubLocal = new Github({
            username: pUser,
            password: pPasswd,
            auth    : 'basic'
        });
    };
    
    GitHubStore.Login               = function(pToken){
        Github = GithubLocal = new Github({
            token   : pToken,
            auth    : 'oauth'
        });
        
        User = GithubLocal.getUser();
    };
    
    /**
     * function creates gist
     */
    GitHubStore.uploadFile      = function(pParams, pCallBack){
        var lContent    = pParams.data,
            lName       = pParams.name;
        
        if(lContent){
            DOM.Images.showLoad();
            if(!lName)
                lName = Util.getDate();
            
            var lGist       = GithubLocal.getGist(),
                lFiles      = {},
                lHost       = CloudCmd.HOST,
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
                Util.log(pError || pData);
                Util.log(pData && pData.html_url);
                
                Util.exec(pCallBack);
            });
        }
        
        return lContent;
    };
    
    GitHubStore.init            = function(pCallBack){
        Util.loadOnLoad([
            Util.retExec(pCallBack),
            GitHubStore.getUserData,
            GitHubStore.autorize,
            load
        ]);
        
        GitHubStore.callback = function(){
            Util.loadOnLoad([
                Util.retExec(pCallBack),
                GitHubStore.getUserData,
            ]);
        };
    };
    
    CloudCmd.GitHub                 = GitHubStore;
})(CloudCmd, Util, DOM);

var CloudCommander, Util, DOM, $, Github, cb;
/* module for work with github */

(function(){
    "use strict";
    
    const   cloudcmd                        = CloudCommander,
            Cache                           = DOM.Cache,
            
            APIURL                          = '/api/v1',
            AuthURL                         = APIURL + '/auth',
            GitHubIdURL                     = APIURL + '/github_key';
    
    var     GitHub_ID,
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
       
        DOM.ajax({
            url     : GitHubIdURL,
            success : function(pData){
                GitHub_ID       = pData;
                Util.exec(pCallBack);
            }
        });
    }
    
   function init(pCallBack){
        var lToken = Cache.get('token');
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
                            Cache.set('token', lToken);
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
                    GitHub_ID + '&&scope=repo,user,gist';
        }
    }
    
    function getUserData(pCallBack){
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
    
    /* PUBLICK FUNCTIONS */
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
    cloudcmd.GitHub.createGist      = function(pContent, pFileName){
        if(pContent){
            if(!pFileName)
                pFileName = Util.getDate();
            
            var lGist       = GithubLocal.getGist(),
                lFiles      = {},
                lHost       = CloudCommander.HOST,
                lOptions    = {
                    description: "Uplouded by Cloud Commander from " + lHost,
                    
                    public: true
                };
                    
            lFiles[pFileName] ={
                content: pContent
            };
            
            lOptions.files = lFiles;
            
            lGist.create(lOptions, cb);
        }
        
        return pContent;
    };
    
    cloudcmd.GitHub.init            = function(pCallBack){
        Util.loadOnLoad([
            Util.retExec(pCallBack),
            getUserData,
            init,
            setConfig,
            load
        ]);
        
        cloudcmd.GitHub.init = null;
    };
    
    cloudcmd.Github                 = GithubStore;
})();

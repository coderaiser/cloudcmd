var CloudCmd, Util, join, DOM, CloudFunc, Github, cb;

(function(CloudCmd, Util, join, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.GitHub     = GitHubProto;
    
    function GitHubProto(callback) {
        var GitHub  = this,
            Storage = DOM.Storage,
            
            GH,
            User;
        
        cb = function (err, data) { Util.log(err || data);};
        
        function init(callback) {
            Util.exec.series([
                load,
                GitHub.autorize,
                GitHub.getUserData,
                Util.exec.ret(callback)
            ]);
            
            GitHub.callback = function() {
                Util.exec.series([
                    GitHub.getUserData,
                    Util.exec.ret(callback)
                ]);
            };
        }
        
        function load(callback) {
            var dir     = CloudCmd.LIBDIRCLIENT + 'storage/github/',
                url   =  join([
                    dir + 'lib/underscore.js',
                    dir + 'lib/base64.js',
                    dir + 'github.js'
                ]);
            
            Util.time('github');
            
            DOM.load.js(url, function() {
                Util.timeEnd('github');
                DOM.Images.hide();
                
                Util.exec(callback);
            });
        }
        
        
        GitHub.autorize            = function(callback, code) {
            Storage.get('token', function(error, token) {
                var isContain,
                    apiURL = CloudFunc.apiURL,
                    URL = '//' + window.location.host + '/auth/github';
               
                if (token) {
                    GitHub.Login(token);
                    Util.exec(callback);
                } else {
                    if (!code)
                        code = window.location.search;
                    
                    isContain = ~code.indexOf('?code=');
                    
                    if (!isContain)
                        DOM.openWindow(URL);
                    else
                        DOM.load.ajax({
                            type    : 'put',
                            url     : apiURL + '/auth',
                            data    : Util.rmStr(code, '?code='),
                            success : function(data) {
                                if (data && data.token) {
                                    token = data.token;
                                    
                                    GitHub.Login(token);
                                    Storage.set('token', token);
                                    Util.exec(callback);
                                } else
                                    Util.log('Worning: token not getted...');
                            }
                        });
                } 
            });
        };
        
        GitHub.getUserData         = function(callback) {
            User.show(null, function(error, data) {
                var name;
                
                if (!error) {
                    name  = data.name;
                    Util.log('Hello ' + name + ' :)!');
                } else
                    DOM.Storage.remove('token');
            });
            
            Util.exec(callback);
        };
        
        /* PUBLIC FUNCTIONS */
        GitHub.basicLogin          = function(user, passwd) {
            GH = new Github({
                username: user,
                password: passwd,
                auth    : 'basic'
            });
        };
        
        GitHub.Login               = function(token) {
            GH = new Github({
                token   : token,
                auth    : 'oauth'
            });
            
            User = GH.getUser();
        };
        
        /**
         * function creates gist
         */
        GitHub.uploadFile      = function(params, callback) {
            var gist, files, options,
                content     = params.data,
                name        = params.name;
            
            if (content) {
                DOM.Images.showLoad();
                
                if (!name)
                    name = Util.getDate();
                
                gist       = GH.getGist();
                files      = {};
                options    = {
                    description: 'Uplouded by http://cloudcmd.io',
                    public: true
                };
                
                files[name] ={
                    content: content
                };
                
                options.files = files;
                
                gist.create(options, function(error, data) {
                    if (error)
                        Util.log(error);
                    else
                        Util.log(data, data.html_url);
                    
                    Util.exec(callback);
                    DOM.Images.hide();
                });
            }
            
            return content;
        };
        
        init(callback);
    }
})(CloudCmd, Util, join, DOM, CloudFunc);

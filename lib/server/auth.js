/* https://github.com/prose/gatekeeper */
(function(){
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
             '# auth.js'                                        + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with authentication.'             + '\n'  +
             '# If you wont to see at work set auth'            + '\n'  +
             '# parameters in config.json or environment'       + '\n'  +
             '# and start cloudcmd.js or just do'               + '\n'  +
             '# require(\'auth.js\').auth(code, сallback)'      + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
             
    var main        = global.cloudcmd.main,
        
        https       = main.https,
        qs          = main.querystring,
        pipe        = main.pipe,
            
        Modules     = main.modules,
        Util        = main.util,
        
        GithubAuth      = {
            host: "github.com",
            port: 443,
            path: "/login/oauth/access_token",
            method: "POST"
        };
    
    /**
     * function do authentication
     * @param code
     * @param callback
     */
     
    exports.auth = function(code, callback){
        code = code.replace('code=', '');
        
        Util.log(code);
        authenticate(code, function(token) {
            var result = { "token": token };
            Util.log(result);
            
            Util.exec(callback, result);
        });
    };
    
    function authenticate(code, callback) {
        var req,
            storage         = Util.findObjByNameInArr(Modules, 'storage'),
            github          = Util.findObjByNameInArr(storage, 'GitHub'),
            
            id              = github && github.key,
            secret          = github && github.secret,
            env             = process.env,
            
            clientId        = env.github_key       || id,
            clientSecret    = env.github_secret    || secret,
            
            data            = qs.stringify({
                client_id       : clientId,
                client_secret   : clientSecret,
                code            : code
            });
        
        Util.log(clientId, clientSecret, data);
        
        GithubAuth.headers  = { 'content-length': data.length };
        
        req                 = https.request(GithubAuth, function(res) {
            pipe.getBody(res, function(body) {
                Util.exec(callback, qs.parse(body).access_token);
            });
        });
        
        req.write(data);
        req.end();
        
        req.on('error', function(e) {
            Util.exec(callback, e.message);
        });
    }
})();

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
             '# require(\'auth.js\').auth(pCode, pCallBack)'    + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
             
    var main        = global.cloudcmd.main,
        
        https       = main.https,
        qs          = main.querystring,
            
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
     * @param pCode
     * @param pCallBack
     */
     
    exports.auth = function(pCode, pCallBack){
        pCode = pCode.replace('code=', '');
        
        console.log(pCode);
        authenticate(pCode, function(token) {
            var result = { "token": token };
            Util.log(result);
            
            Util.exec(pCallBack, result);
        });
    };
    
    function authenticate(pCode, pCallBack) {
        var lStorage        = Util.findObjByNameInArr(Modules, 'storage'),
            lGitHub         = Util.findObjByNameInArr(lStorage, 'GitHub'),
            
            lId             = lGitHub && lGitHub.key,
            lSecret         = lGitHub && lGitHub.secret,
            lEnv            = process.env,
            
            lClientId       = lEnv.github_key       || lId,
            lClientSecret   = lEnv.github_secret    || lSecret;
        
        Util.log(lClientId);
        Util.log(lClientSecret);
        
        var data = qs.stringify({
            client_id       : lClientId,
            client_secret   : lClientSecret,
            code            : pCode
        });
        Util.log(data);
        
        GithubAuth.headers = { 'content-length': data.length };
            
        var body = "",
            req = https.request(GithubAuth, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) { body += chunk; });
                res.on('end', function() {
                    Util.exec(pCallBack, qs.parse(body).access_token);
                });
            });
        
        req.write(data);
        req.end();
        req.on('error', function(e) { Util.exec(pCallBack, e.message); });
    }
})();

/* https://github.com/prose/gatekeeper */
(function(){
    "use strict";
        
    var DIR             = process.cwd() + '/',
        main            = require(DIR + 'lib/server/main'),
        
        https           = main.https,
        qs              = main.querystring,
            
        Config          = main.config,
        
        Util            = main.util,
        
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
        pCode = pCode.replace('code=','');
        
        console.log(pCode);
        authenticate(pCode, function(token) {
            var result = { "token": token };
            console.log(result);
            
            Util.exec(pCallBack, result);
        });
    };
    
    function authenticate(pCode, pCallBack) {
        var lId             = Config.oauth_client_id,
            lSecret         = Config.oauth_client_secret,
            lEnv            = process.env,
            
            lClientId       = lEnv.oauth_client_id      || lId,
            lClientSecret   = lEnv.oauth_client_secret  || lSecret;
                
        var data = qs.stringify({
            client_id       : lClientId,
            client_secret   : lClientSecret,
            code            : pCode
        });
        
        GithubAuth.headers = { 'content-length': data.length };
            
        var body = "",
            req = https.request(GithubAuth, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) { body += chunk; });
                res.on('end', function() {
                    pCallBack(qs.parse(body).access_token);
                });
            });
        
        req.write(data);
        req.end();
        req.on('error', function(e) { pCallBack(e.message); });
    }
})();

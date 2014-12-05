(function() {
    'use strict';
    
    var DIR         = './',
        DIR_LIB     = DIR + '../',
        DIR_JSON    = DIR_LIB + '../json/',
       
        https       = require('https'),
        qs          = require('querystring'),
        
        pipe        = require('pipe-io'),
            
        Modules     = require(DIR_JSON + 'modules'),
        Util        = require(DIR_LIB + 'util'),
        
        GithubAuth      = {
            host: 'github.com',
            port: 443,
            path: '/login/oauth/access_token',
            method: 'POST'
        };
    
    /**
     * function do authentication
     * @param code
     * @param callback
     */
     
    exports.auth = function(code, callback){
        code = code.replace('code=', '');
        
        Util.log(code);
        
        authenticate(code, function(error, token) {
            var result = { 'token': token };
            Util.log(error || result);
            
            Util.exec(callback, error, result);
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
            pipe.getBody(res, function(error, body) {
                var parsed, token;
                
                if (!error) {
                    parsed  =  qs.parse(body);
                    
                    if (parsed)
                        token   =  parsed.access_token;
                }
                
                Util.exec(callback, error, token);
            });
        });
        
        req.end(data);
        
        req.on('error', function(e) {
            Util.exec(callback, e.message);
        });
    }
})();

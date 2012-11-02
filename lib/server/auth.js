/* https://github.com/prose/gatekeeper */

var DIR             = process.cwd() + '/',
    main            = require(DIR + 'lib/server/main'),
    LIBDIR          = main.LIBDIR,
    SRVDIR          = main.SRVDIR,
    
    https           = main.https,
    qs              = main.querystring,
        
    Config          = main.config,
    
    Util            = main.uti,
    
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
        
        Util.exec(pCallBack);
    });
};


function authenticate(pCode, pCallBack) {
    var data = qs.stringify({
        client_id       : Config.oauth_client_id,
        client_secret   : Config.oauth_client_secret,
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
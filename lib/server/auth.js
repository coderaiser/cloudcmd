/* https://github.com/prose/gatekeeper */

var https           = require('https'),
    fs              = require('fs'),
    qs              = require('querystring'),
    Config;

exports.auth = function(pCode, pCallBack){
    
    fs.readFile(process.cwd() + 'tokens.json', function(pErr, pData){
        pCode = pCode.replace('code=','');

        console.log('d');
        var TokensFile = {};
        if(!pErr && pData){
            TokensFile = JSON.parse(pData);
        }
        if( !TokensFile[pCode] )
            readConfig(pCode, pCallBack);
        else 
            pCallBack();
        
        pCallBack();
    });
    
};


function readConfig(pCode, pCallBack){
    Config = require(process.cwd() + '/auth');
        
    for (var i in Config)
        Config[i] = process.env[i.toUpperCase()] || Config[i];
    
    console.log('Configuration');
    console.log(Config);

    authenticate(pCode, function(err, token) {
        var result = { "token": token };
        
        fs.createWriteStream('tokens.json',{'flags': 'a'})
            .end('{' + pCode + ':' + token + '}\n');
        
        console.log(result);
        console.log(err);
    });
    
    if(typeof pCallBack === 'function')
        pCallBack();
}

/* Load config defaults from JSON file.
 *  Environment variables override defaults.
 */


function authenticate(pCode, cb) {
    var data = qs.stringify({
        client_id       : Config.oauth_client_id,
        client_secret   : Config.oauth_client_secret,
        code            : pCode
    });

    var reqOptions = {
        host: "github.com",
        port: 443,
        path: "/login/oauth/access_token",
        method: "POST",
        headers : { 'content-length': data.length }
    };
    
    var body = "";
    var req = https.request(reqOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) { body += chunk; });
        res.on('end', function() {
            cb(null, qs.parse(body).access_token);          
        });
    });
    
    req.write(data);
    req.end();
    req.on('error', function(e) { cb(e.message); });
}
/* RESTfull module */

(function(){
    "use strict";
    
    var DIR         = process.cwd() + '/',
        main        = require(DIR + 'lib/server/main.js'),
        SRVDIR      = main.SRVDIR,
        Util        = main.util,
    
        APIURL      = '/api/v1/';
    
    exports.rest = function(req, res, pCallBack){
    var lUrl    = req.url,
        lMethod = req.method;
    
    console.log(lUrl);
    /* if lUrl contains api url */
    if( Util.isContainStr(lUrl, APIURL) ){
        lUrl = lUrl.replace(APIURL, '');
        console.log(lUrl);
    }
    
    console.log(req.url);
    console.log(lMethod);
    
    Util.exec(pCallBack);
    
    /*
            switch(req.method){
                case 'GET':
                    switch(lCommand){
                        case 'count':
                            lResult = {
                                count  : Users.length,
                            };
                            break;
                            
                        case 'list':
                            lResult = Users;
                            break;
                    }
                    break;
                    
                case 'PUT':
                    if( lCommand.indexOf('register') === 0 ){                        
                        lResult = {
                            registered  : true,
                            name        : req.body.name,
                            server_time : Util.getTime(),
                            client_time : req.body.time
                        };
                        Users.push(req.body.name);
                        
                        console.log(lResult);
                        console.log(req.connection.remoteAddress);
                    }
                    break;
            }
                        */
            
    };
})();

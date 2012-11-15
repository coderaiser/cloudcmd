/* RESTfull module */

(function(){
    "use strict";
    
    var DIR         = process.cwd() + '/',
        main        = require(DIR + 'lib/server/main'),
        Util        = main.util,
    
        APIURL  = '/api/v1/';
    
    /**
     * rest interface
     * @pConnectionData {request, responce}
     */
    exports.api = function(pConnectionData){
        var lRet    = false,
            lReq    = pConnectionData.request,
            lRes    = pConnectionData.response,
            lUrl    = lReq.url,
            lMethod = lReq.method;
        
        console.log(lUrl);
        console.log(lMethod);
        
        if( Util.isContainStr(lUrl, APIURL) ){
            console.log('api !!!!!!!!!!!! ');
            return true;
        }
        
        return lRet;
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

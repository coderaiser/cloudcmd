/* RESTfull module */

(function(){
    "use strict";
    
    var DIR         = process.cwd() + '/',
        main        = require(DIR   + 'lib/server/main'),
        Util        = main.util,
        APIURL      = '/api/v1',
        OK          = 200,
        Header      = main.generateHeaders('api.json', false);
        
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
        
        if( Util.isContainStr(lUrl, APIURL) ){
            lRet = true;
            
            getBody(lReq, function(pBody){
                var lCommand = Util.removeStr(lUrl, APIURL),
                    lData = getData({
                        command     : lCommand,
                        method      : lMethod,
                        body        : pBody,
                        response    : lRes
                    });
                
                if(lData)
                    send(lRes, lData);
            });
        }
        
        return lRet;
    };
    
    
    /**
     * send data
     * 
     * @param pRes
     * @param pData
     */
    function send(pRes, pData){
        pRes.writeHead(OK, Header);
        pRes.end( JSON.stringify(pData) );
    }
    
    /**
     * getting data on method and command
     * 
     * @param pParams {command, method, body, response}
     */
    function getData(pParams){
        var lResult,
            lCmd    = pParams.command,
            lMethod = pParams.method;
        
        if(lCmd[0] === '/'){
            lCmd = Util.removeStr(lCmd, '/');
            pParams.command = lCmd;
        }
        
        switch(lMethod){
            case 'GET':
                lResult = onGET(pParams);
                break;
                
            case 'PUT':
                lResult = onPUT(pParams);
                break;
            }
        
        return lResult;
    }
    
    /**
     * process data on GET request
     * 
     * @param pParams {command, method, body, response}
     */
    function onGET(pParams){
        var lResult,
            lCmd = pParams.command;
        
        switch(lCmd){
            case '':
                lResult = {info: 'Cloud Commander API v1'};
                break;
            case 'kill':
                process.exit();
                break;
            case 'client_id':
                var lEnv    = process.env,
                    lConfig = main.config;
                
                lResult = lEnv.oauth_client_id || lConfig.oauth_client_id;
        }
        
        return lResult;
    }
    
    /**
     * process data on PUT request
     * 
     * @param pParams {command, method, body, response}
     */
    function onPUT(pParams){
        var lResult,
            lCmd    = pParams.command,
            lBody   = pParams.body,
            lRes    = pParams.response;
        
        switch(lCmd){
            case 'auth':
                main.auth(lBody, function(pTocken){
                    send(lRes, pTocken);
                });
                lResult = false;
                break;
        }
        
        return lResult;
    }
    
    function getBody(pReq, pCallBack){ 
        var lBody = '';
        pReq.on('data', function(chunk) {
            lBody += chunk.toString();
        });
        
        pReq.on('end', function() {
            Util.exec(pCallBack, lBody);
        });
    }
    
})();

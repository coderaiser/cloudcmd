/* RESTfull module */

(function(){
    "use strict";
    
    var main        = global.cloudcmd.main,
        Util        = main.util,
        fs          = main.fs,
        zlib        = main.zlib,
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
        var lResult = {error: 'command not found'},
            lCmd = pParams.command;
        
        switch(lCmd){
            case '':
                lResult = {info: 'Cloud Commander API v1'};
                break;
            
            case 'client_id':
                var lEnv    = process.env,
                    lConfig = main.config;
            
                lResult = lEnv.oauth_client_id || lConfig.oauth_client_id;
                break;
            
            case 'kill':
                process.exit();
                break;
        }
        
        return lResult;
    }
    
    /**
     * process data on PUT request
     * 
     * @param pParams {command, method, body, response}
     */
    function onPUT(pParams){
        var lResult = {error: 'command not found'},
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
            
            /* Example:
             * read=[lib/dom.js, lib/cloudfunc.js, client.js]
             */
            case 'read':
                console.log(lBody);
                var lFiles = lBody;
                
                if( Util.isString(lFiles) ){
                    lRes.writeHead(OK, main.generateHeaders(lFiles, true) );
                    
                    fs.createReadStream(lFiles, {
                        'bufferSize': 4 * 1024
                    })
                    .pipe( zlib.createGzip() )
                    .pipe(lRes);
                    
                    lResult = null;
                }
                
                break;
        }
        
        
        return lResult;
    }
    
    /**
     * get body of url query
     *
     * @param pReq
     * @param pCallBack
     */
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

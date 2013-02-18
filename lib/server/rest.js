/* RESTfull module */

(function(){
    "use strict";
    
    if(!global.cloudcmd)
        return console.log(
             '# rest.js'                                        + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with REST API.'                   + '\n'  +
             '# If you wont to see at work set rest: true'      + '\n'  +
             '# and api_url in config.json'                     + '\n'  +
             '# http://coderaiser.github.com/cloudcmd'          + '\n');
    
    var main        = global.cloudcmd.main,
        Util        = main.util,
        Config      = main.config,
        APIURL      = Config.api_url,
        OK          = 200,
        Header      = main.generateHeaders('api.json', false);
        
    /**
     * rest interface
     * @pParams {request, responce}
     */
    exports.api = function(pParams){
        var lRet,
            lReq    = pParams.request,
            lRes    = pParams.response,
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
                        request     : lReq,
                        response    : lRes
                    });
                
                if(lData)
                    send({
                        response : lRes,
                        data     : lData
                    });
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
    function send(pParams){
        var lRes            = pParams.response,
            lData           = pParams.data;
        
        lRes.writeHead(OK, Header);
        lRes.end( JSON.stringify(lData) );
    }
    
    /**
     * getting data on method and command
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function getData(pParams){
        var lResult,
            lCmd    = pParams.command,
            lMethod = pParams.method;
        
        if(lCmd[0] === '/'){
            lCmd = Util.removeStr(lCmd, '/');
            pParams.command = lCmd;
        }
        if(lCmd === 'fs')
            onFS(pParams);
        else
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
    
    function onFS(pParams){
        var lResult,
            lMethod = pParams.method;
        switch(lMethod){
            case 'GET':
                pParams.data = {
                    mesage: 'fs called'
                };
                send(pParams);
                lResult = true;
                break;
                
            case 'PUT':
                lResult = onPUT(pParams);
                break;
            }
    }
    
    /**
     * process data on GET request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onGET(pParams){
        var lResult = {error: 'command not found'},
            lCmd    = pParams.command;
        
        switch(lCmd){
            case '':
                lResult = {info: 'Cloud Commander API v1'};
                break;
                
            case 'kill':
                pParams.data = {
                    mesage: 'Cloud Commander was killed'
                };
                send(pParams);
                lResult = null;
                break;
        }
        
        return lResult;
    }
    
    /**
     * process data on PUT request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onPUT(pParams){
        var lResult = {error: 'command not found'},
            lCmd    = pParams.command,
            lBody   = pParams.body,
            lRes    = pParams.response;
        
        switch(lCmd){
            case 'auth':
                main.auth(lBody, function(pTocken){
                    send({
                        response: lRes,
                        data: pTocken
                    });
                });
                
                lResult = false;
                break;
            
            case 'read':
                console.log(lBody);
                var lFiles = lBody;
                                
                if( Util.isString(lFiles) ){
                    pParams.name = lFiles;
                    main.sendFile(pParams);
                    
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
        
        pReq.on('data', function(chunk){
            lBody += chunk.toString();
        });
        
        pReq.on('end', function() {
            Util.exec(pCallBack, lBody);
        });
    }
    
})();

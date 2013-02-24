/* RESTfull module */

(function(){
    'use strict';
    
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
        OK          = 200,
        Header      = main.generateHeaders({
            name:'api.json'
        });
        
    /**
     * rest interface
     * @pParams {request, responce}
     */
    exports.api = function(pParams){
        var lRet,
            lReq    = pParams.request,
            lRes    = pParams.response,
            lUrl    = lReq.url,
            lMethod = lReq.method,
            lConfig = main.config,
            lAPIURL = lConfig.api_url;
        
        if( Util.isContainStr(lUrl, lAPIURL) ){
            lRet = true;
            
            getBody(lReq, function(pBody){
                var lCommand = Util.removeStr(lUrl, lAPIURL);
                getData({
                    command     : lCommand,
                    method      : lMethod,
                    body        : pBody,
                    request     : lReq,
                    response    : lRes
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
        
        if( Util.isContainStr(lCmd, 'fs') )
            lResult = onFS({
                request : pParams.request,
                response: pParams.response,
                method  : lMethod,
                name    : lCmd
            });
        
        if(lCmd[0] === '/'){
            lCmd = Util.removeStr(lCmd, '/');
            pParams.command = lCmd;
        }
        
        if(!lResult)
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
            lMethod = pParams.method,
            lName   = Util.removeStr(pParams.name, 'fs');
        
        switch(lMethod){
            case 'GET':
                main.commander.getDirContent(lName, function(pError, pData){
                    if(!pError){
                        pParams.request.url += '.json';
                        pParams.name = lName;
                        pParams.data = Util.stringifyJSON(pData);
                        main.sendResponse(pParams);
                    }
                    else
                        main.sendError(pParams, pError);
                });
                
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
     * @param pParams {command, method, body, requrest, response}
     */
    function onGET(pParams){
        var lCmd    = pParams.command;
        
        switch(lCmd){
            case '':
                pParams.data = {
                    info: 'Cloud Commander API v1'
                };
                send(pParams);
                break;
                
            case 'kill':
                pParams.data = {
                    mesage: 'Cloud Commander was killed'
                };
                send(pParams);
                break;
            default:
                pParams.data = {
                    error: 'command not found'
                };
                send(pParams);
                break;
        }
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

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
        fs          = main.fs,
        Util        = main.util,
        CloudFunc   = main.cloudfunc,
        OK          = 200,
        Header      = main.generateHeaders({
            name:'api.json'
        });
        
    /**
     * rest interface
     * @pParams {request, responce}
     */
    exports.api = function(pParams){
        var lRet = main.checkParams(pParams);
        if(lRet){
            var lAPIURL     = main.config.api_url,
                p           = pParams;
            
            lRet = Util.isContainStr(p.name, lAPIURL);
            if( lRet ){
                p.name = Util.removeStr(p.name, lAPIURL);
                sendData( pParams);
            }
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
    function sendData(pParams){
        var lRet = main.checkParams(pParams);
        if(lRet){
            var p = pParams;
            
            if( Util.isContainStr(p.name, CloudFunc.FS) )
                lRet = onFS(pParams);
            
            if(p.name[0] === '/')
                p.command = Util.removeStr(p.name, '/');
            
            if(!lRet)
                switch(p.request.method){
                    case 'GET':
                        lRet = onGET(pParams);
                        break;
                        
                    case 'PUT':
                        getBody(pParams.request, function(pBody){
                            pParams.body = pBody;
                            onPUT(pParams);
                        });
                        break;
                    }
        }
        return lRet;
    }
    
    function onFS(pParams){
        var lRet = main.checkParams(pParams);
        if(lRet){
            var p       = pParams,
                lQuery  = main.getQuery(p.request);
            
            p.name  = Util.removeStr(p.name, [CloudFunc.FS, '?dir']) || '/';
            switch(p.request.method){
                case 'GET':
                    fs.stat(p.name, function(pError, pStat){
                        if(!pError)
                            if( pStat.isDirectory() )
                                main.commander.getDirContent(pParams.name, function(pError, pData){
                                    if(!pError){
                                        pParams.request.url += '.json';
                                        pParams.data = Util.stringifyJSON(pData);
                                        main.sendResponse(pParams);
                                    }
                                    else
                                        main.sendError(pParams, pError);
                                });
                            else
                                main.sendFile(pParams);
                        else
                            main.sendError(pParams, pError);
                    
                    });
                    
                    break;
                    
                case 'PUT':
                    if(lQuery === 'dir')
                        fs.mkdir(p.name, function(pError){
                            if(!pError)
                                main.sendResponse(pParams, 'Folder ' + p.name + ' created.');
                            else
                                main.sendError(pParams, pError);
                        });
                    else{
                        var lWriteStream = fs.createWriteStream(p.name);
                        
                        lWriteStream.on('error', function(pError){
                            console.log(pError);
                            main.sendError(pParams, pError);
                        });
                        
                        p.request.on('end', function(){
                            main.sendResponse(pParams, 'writed: ' + p.name);
                        });
                        
                        //p.request.pipe(process.stdout);
                        p.request.pipe(lWriteStream);
                    }
                    break;
                case 'DELETE':
                    console.log('1111111111111')
                    if(lQuery === 'dir')
                        fs.rmdir(p.name, function(pError){
                        if(!pError)
                            main.sendResponse(pParams, 'Folder ' + p.name + ' deleted.');
                        else
                            main.sendError(pParams, pError);
                        });
                    else 
                        fs.unlink(p.name, function(pError){
                            if(!pError)
                                main.sendResponse(pParams, 'File ' + p.name + ' delete.');
                            else
                                main.sendError(pParams, pError);
                        });
                    
                    break;
                }
        }
        return lRet;
    }
    
    /**
     * process data on GET request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onGET(pParams){
        var lRet = main.checkParams(pParams);
        if(lRet){
            var p       = pParams,
                lCmd    = p.command;
            
            switch(lCmd){
                case '':
                    p.data = {
                        info: 'Cloud Commander API v1'
                    };
                    send(p);
                    break;
                    
                case 'kill':
                    p.data = {
                        mesage: 'Cloud Commander was killed'
                    };
                    send(p);
                    break;
                default:
                    p.data = {
                        error: 'command not found'
                    };
                    send(p);
                    break;
            }
        }
        
        return lRet;
    }
    
    /**
     * process data on PUT request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onPUT(pParams){
        var lRet        = main.checkParams(pParams, ['body']);
        if(lRet){
            var p       = pParams,
                lCmd    = p.command,
                lFiles  = Util.stringifyJSON(p.body);
            
            switch(lCmd){
                case 'auth':
                    main.auth(p.body, function(pTocken){
                        send({
                            response: p.response,
                            data: pTocken
                        });
                    });
                    break;
                
                case 'cmd':
                    main.child_process.exec(p.body, function(pError, pStdout, pStderr){
                        var lError = pError || pStderr;
                        if(!lError)
                            main.sendResponse(pParams, pStdout);
                        else
                            main.sendError(pParams, lError);
                    });
                    break;
                case 'mv':
                    if(lFiles)
                        fs.rename(lFiles.from, lFiles.to, function(pError){
                            if(!pError)
                                main.sendResponse(pParams);
                            else
                                main.sendError(pParams, pError);
                        });
                    break;
                
                case 'cp':
                    if(lFiles){
                        var lReadStream     = fs.createReadStream(lFiles.from),
                            lWriteStream    = fs.createWriteStream(lFiles.to),
                            lError          = function(pError){
                                main.sendError(pParams, pError);
                            };
                            
                            
                            lWriteStream.on('error', lError);
                            lReadStream.on('error', lError);
                            
                            lWriteStream.on('end', function(){
                                main.sendResponse(pParams, 'copied: ' + p.name);
                            });
                        
                        lReadStream.pipe(lWriteStream);
                    }
                    break;
                default:
                    send(pParams);
                    break;
                }
            }
        
        return lRet;
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

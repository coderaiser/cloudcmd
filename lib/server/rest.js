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
        dir         = main.dir,
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
                p.name = Util.removeStrOneTime(p.name, lAPIURL);
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
            var p   = pParams;
            
            lRet    = Util.isContainStrAtBegin(p.name, CloudFunc.FS);
            if( lRet)
                onFS(pParams);
            else{
                if(p.name[0] === '/')
                    p.command = Util.removeStrOneTime(p.name, '/');
                
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
        }
        return lRet;
    }
    
    function onFS(pParams){
        var lRet = main.checkParams(pParams);
        if(lRet){
            var p       = pParams,
                lQuery  = main.getQuery(p.request);
            
            p.name  = Util.removeStrOneTime(p.name, CloudFunc.FS) || '/';
            switch(p.request.method){
                case 'GET':
                    if( Util.strCmp(lQuery, 'size') )
                        dir.getSize(p.name, function(pErr, pSize){
                            if(!pErr){
                                var lSize = CloudFunc.getShortSize(pSize);
                                console.log(lSize);
                                main.sendResponse(pParams, lSize);
                            }
                            else
                                main.sendError(pParams, pErr);
                        });
                else
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
                    if(lQuery === 'dir')
                        fs.rmdir(p.name, function(pError){
                            if(!pError)
                                main.sendResponse(pParams, 'Folder ' + p.name + ' deleted.');
                            else
                                main.sendError(pParams, pError);
                            });
                    else if(lQuery === 'files'){
                        getBody(p.request, function(pBody){
                            var lFiles  = Util.parseJSON(pBody),
                                lDir   = p.name;
                            
                            function stat(pParams){
                                var lRet = Util.checkParams(pParams, 'params');
                                
                                if(lRet){
                                    var p = pParams,
                                        d = p.params;
                                    
                                    if(p.data.isDirectory()){
                                        
                                    }
                                    else if(p.data.isFile()){
                                        
                                    }
                                }
                            }
                            
                            
                            for(var i = 0, n = lFiles.length; i < n; i ++){
                                Util.log(lDir + lFiles[i]);
                                //fs.stat(lDir + lFiles[i], Util.call())
                            }
                            
                            main.sendResponse(pParams, pBody);
                        });
                    }else
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
                
                case 'proxy':
                    
                    break;
                    
                case 'zip':
                    main.sendFile(pParams);
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
                lFiles  = Util.parseJSON(p.body);
            console.log(p.body);
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
                    if( Util.checkObjTrue(lFiles, ['from', 'to']) )
                        fs.rename(lFiles.from, lFiles.to, function(pError){
                            if(!pError)
                                main.sendResponse(pParams);
                            else
                                main.sendError(pParams, pError);
                        });
                    else
                        main.sendError(pParams, p.data);
                    break;
                
                case 'cp':
                     if( Util.checkObjTrue(lFiles, ['from', 'to']) ){
                        var l               = lFiles,
                            lReadStream     = fs.createReadStream(l.from),
                            lWriteStream    = fs.createWriteStream(l.to),
                            
                            lError          = function(pError){
                                main.sendError(pParams, pError);
                            };
                            
                            lWriteStream.on('error', lError);
                            lReadStream.on('error', lError);
                            
                            lReadStream.on('end', function(){
                                main.sendResponse(pParams, 'copied to: ' + l.to);
                            });
                        
                        lReadStream.pipe(lWriteStream);
                    }
                    else
                        main.sendError(pParams, p.data);
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

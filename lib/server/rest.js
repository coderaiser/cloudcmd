/* RESTfull module */

(function() {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# rest.js'                                        + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with REST API.'                   + '\n'  +
             '# If you wont to see at work set rest: true'      + '\n'  +
             '# and api_url in config.json'                     + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = main.fs,
        path        = main.path,
        Util        = main.util,
        pipe        = main.pipe,
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
    exports.api = function(pParams) {
        var lRet = main.checkParams(pParams);
        
        if (lRet) {
            var lAPIURL     = main.config.api_url,
                p           = pParams;
            
            lRet = Util.isContainStr(p.name, lAPIURL);
            if (lRet) {
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
    function send(pParams) {
        var lRes            = pParams.response,
            lData           = pParams.data;
        
        lRes.writeHead(OK, Header);
        lRes.end( Util.stringifyJSON(lData) );
    }
    
    /**
     * getting data on method and command
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function sendData(pParams) {
        var p, lRet = main.checkParams(pParams);
        if(lRet){
            p       = pParams;
            lRet    = Util.isContainStrAtBegin(p.name, CloudFunc.FS);
            
            if (lRet)
                onFS(pParams);
            else {
                if(p.name[0] === '/')
                    p.command = Util.removeStrOneTime(p.name, '/');
                
                switch(p.request.method){
                    case 'GET':
                        lRet = onGET(pParams);
                        break;
                        
                    case 'PUT':
                        getBody(p.request, function(pBody){
                            p.body = pBody;
                            onPUT(p);
                        });
                        break;
                    }
            }
        }
        return lRet;
    }
    
    function onFS(pParams) {
        var p, lError, lMsg, lSize, lQuery,
            lRet = main.checkParams(pParams);
        
        if (lRet){
            p       = pParams,
            lQuery  = main.getQuery(p.request);
            p.name  = Util.removeStrOneTime(p.name, CloudFunc.FS) || '/';
            
            switch (p.request.method) {
            case 'GET':
                if (Util.strCmp(lQuery, 'size'))
                    dir.getSize(p.name, function(pErr, pSize) {
                        if (pErr)
                            main.sendError(p, pErr);
                        else {
                            lSize = CloudFunc.getShortSize(pSize);
                            main.sendResponse(p, lSize);
                        }
                        
                    });
                else
                    fs.stat(p.name, function(pError, pStat) {
                        if (pError)
                            main.sendError(p, pError);
                        else
                            if (!pStat.isDirectory())
                                main.sendFile(p);
                            else
                                main.commander.getDirContent(p.name, function(pError, pData) {
                                    if (pError)
                                        main.sendError(p, pError);
                                    else {
                                        p.name += '.json';
                                        p.data = Util.stringifyJSON(pData);
                                        main.sendResponse(p);
                                    }
                                });
                    });
            break;
                
            case 'PUT':
                if (lQuery === 'dir')
                    fs.mkdir(p.name, function(pError) {
                        if (!pError)
                            sendMsg(pParams, 'make dir', p.name);
                        else
                            main.sendError(pParams, pError);
                    });
                
                else
                    pipe.create({
                        read        : p.request,
                        to          : p.name,
                        callback    : function(pError) {
                            var lName;
                            
                            if (pError)
                                main.sendError(pParams, pError);
                            else {
                                lName = path.basename(p.name);
                                sendMsg(pParams, 'save', lName);
                            }
                        }
                    });
                break;
                
            case 'DELETE':
                if (lQuery === 'dir')
                    fs.rmdir(p.name, function(pError){
                        if (!pError)
                            sendMsg(pParams, 'delete', p.name);
                        else
                            main.sendError(pParams, pError);
                        });
                else if (lQuery === 'files') {
                    getBody(p.request, function(pBody) {
                        var lFiles  = Util.parseJSON(pBody),
                            n       = lFiles.length,
                            lDir    = p.name,
                            log     = Util.log,
                            lAssync = 0;
                        
                        function stat(pStat) {
                            var lRet =  Util.checkObjTrue(pStat, 'params') &&
                                        Util.checkObjTrue(pStat.params, 'name');
                            
                            if (lRet) {
                                var p       = pStat,
                                    d       = p.params;
                                
                                ++lAssync;
                                
                                if (p.error){
                                    main.sendError(pParams, p.error);
                                    log(p.error);
                                }
                                else
                                    if (p.data.isDirectory())
                                        fs.rmdir(d.name, log);
                                
                                    else if (p.data.isFile())
                                        fs.unlink(d.name, log);
                                
                                if (lAssync === n && !p.error)
                                    sendMsg(pParams, 'delete', pBody);
                            }
                        }
                        
                        
                        for(var i = 0; i < n; i ++) {
                            var lName = lDir + lFiles[i];
                            Util.log(lName);
                            fs.stat(lName, Util.call(stat, {
                                name: lName
                            }));
                        }
                    });
                }else
                    fs.unlink(p.name, function(pError) {
                        if (!pError)
                            sendMsg(pParams, 'delete', p.name);
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
    function onGET(pParams) {
        var lRet = main.checkParams(pParams);
        if (lRet) {
            var p       = pParams,
                lCmd    = p.command;
            
            switch(lCmd) {
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
    function onPUT(pParams) {
        var lRet        = main.checkParams(pParams, ['body']);
        if (lRet) {
            var p       = pParams,
                lCmd    = p.command,
                lFiles  = Util.parseJSON(p.body);
            
            switch(lCmd) {
            case 'auth':
                main.auth(p.body, function(pTocken){
                    send({
                        response: p.response,
                        data: pTocken
                    });
                });
                break;
            
            case 'cmd':
                main.child_process.exec(p.body, function(pError, pStdout, pStderr) {
                    var lError = pError || pStderr;
                    if (!lError)
                        main.sendResponse(pParams, pStdout);
                    else
                        main.sendError(pParams, lError);
                });
                break;
            
            case 'mv':
                if( Util.checkObjTrue(lFiles, ['from', 'to']) )
                    fs.rename(lFiles.from, lFiles.to, function(pError) {
                        if(!pError)
                            main.sendResponse(pParams);
                        else
                            main.sendError(pParams, pError);
                    });
                else
                    main.sendError(pParams, p.data);
                break;
            
            case 'cp':
                 if (Util.checkObjTrue(lFiles, ['from', 'to']))
                    pipe.create({
                        from        : lFiles.from,
                        to          : lFiles.to,
                        callback    : function(pError) {
                            if (pError)
                                main.sendError(pParams, pError);
                            else
                                sendMsg(pParams, 'copy', lFiles.to);
                        }
                    });
                else
                    main.sendError(pParams, p.data);
                break;
            
            case 'zip':
                if (Util.checkObjTrue(lFiles, ['from']))
                    pipe.create({
                        from        : lFiles.from,
                        to          : lFiles.to || lFiles.from + '.zip',
                        zip         : true,
                        callback    : function(pError) {
                            var lName;
                            
                            if (pError)
                                main.sendError(pParams, pError);
                            else {
                                lName = path.basename(lFiles.from);
                                sendMsg(pParams, 'zip', lName);
                            }
                        }
                    });
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
    function getBody(pReq, pCallBack) {
        var lBody = '';
        
        pReq.on('data', function(chunk) {
            lBody += chunk.toString();
        });
        
        pReq.on('end', function() {
            Util.exec(pCallBack, lBody);
        });
    }
    
    function sendMsg(pParams, pMsg, pName) {
        var msg = CloudFunc.formatMsg(pMsg, pName);
        main.sendResponse(pParams, msg);
    }
    
})();

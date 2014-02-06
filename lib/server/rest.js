/* RESTful module */

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
        Hash        = main.hash,
        crypto      = main.crypto,
        Util        = main.util,
        pipe        = main.pipe,
        CloudFunc   = main.cloudfunc,
        dir         = main.dir,
        diff        = main.diff,
        time        = main.time,
        JSONDIR     = main.JSONDIR,
        OK          = 200,
        sendError   = main.sendError,
        sendResponse= main.sendResponse,
        Header      = main.generateHeaders({
            name:'api.json'
        });
        
    /**
     * rest interface
     * @pParams {request, responce}
     */
    exports.api = function(pParams) {
        var ret = main.checkParams(pParams);
        
        if (ret) {
            var lAPIURL     = main.config.apiURL,
                p           = pParams;
            
            ret = Util.isContainStr(p.name, lAPIURL);
            if (ret) {
                p.name = Util.removeStrOneTime(p.name, lAPIURL) || '/';
                sendData(pParams);
            }
        }
        return ret;
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
        var p, ret  = main.checkParams(pParams);
        if (ret) {
            p       = pParams;
            ret     = Util.isContainStrAtBegin(p.name, CloudFunc.FS);
            
            if (ret)
                onFS(pParams);
            else {
                if (p.name[0] === '/')
                    p.command = Util.removeStrOneTime(p.name, '/');
                
                switch(p.request.method) {
                    case 'GET':
                        ret = onGET(pParams);
                        break;
                        
                    case 'PUT':
                        getBody(p.request, function(pBody) {
                            p.body = pBody;
                            onPUT(p);
                        });
                        break;
                    }
            }
        }
        return ret;
    }
    
    function onFS(params) {
        var p, lQuery, isGet,
            ret     = main.checkParams(params);
        
        if (ret) {
            p       = params;
            lQuery  = main.getQuery(p.request);
            p.name  = Util.removeStrOneTime(p.name, CloudFunc.FS) || '/';
            
            switch (p.request.method) {
            case 'GET':
                isGet = onFSGet(lQuery, p.name, function(error, result) {
                    checkSendError(error, params, function() {
                        sendResponse(p, result);
                    });
                });
                
                if (!isGet)
                    fs.stat(p.name, function(error, stat) {
                        var getDirContent = main.commander.getDirContent;
                        
                        if (error)
                            Util.exec(error);
                        else
                            if (!stat.isDirectory())
                                main.sendFile(p);
                            else
                                getDirContent(p.name, function(pError, pData) {
                                    checkSendError(pError, p, function() {
                                        p.name += '.json';
                                        p.data = Util.stringifyJSON(pData);
                                        sendResponse(p);
                                    });
                                });
                    });
                
            break;
                
            case 'PUT':
                if (lQuery === 'dir')
                    fs.mkdir(p.name, function(pError) {
                        checkSendError(pError, params, function() {
                            sendMsg(params, 'make dir', p.name);
                        });
                    });
                   else if (lQuery === 'patch')
                        getBody(p.request, function(pPatch) {
                            fs.readFile(p.name, Util.call(read, params));
                            
                            function read(params) {
                                var lDiff, lStr, p, lData, lName,
                                    ret     = main.checkCallBackParams(params) &&
                                              main.checkParams(params.params);
                                
                                if (ret) {
                                    p       = params;
                                    lName   = p.params.name;
                                    
                                    checkSendError(p.error, p.params, function() {
                                        lStr = p.data.toString();
                                        ret = Util.tryCatchLog(function() {
                                            lDiff = diff.applyPatch(lStr, pPatch);
                                        });
                                        
                                        if (lDiff && !ret)
                                            fs.writeFile(lName, lDiff, Util.call(write, p.params));
                                        else {
                                            lName = path.basename(lName);
                                            sendMsg(p.params, 'patch', lName, 'fail');
                                        }
                                    });
                                }
                            }
                            
                            function write(params) {
                                var p, lName,
                                    ret    = main.checkCallBackParams(params) &&
                                              main.checkParams(params.params);
                                
                                if (ret) {
                                    p = params;
                                    
                                    checkSendError(p.error, p.params, function() {
                                        lName = path.basename(p.params.name);
                                        sendMsg(p.params, 'patch', lName);
                                    });
                                }
                            }
                    });
                else
                    pipe.create({
                        read        : p.request,
                        to          : p.name,
                        callback    : function(pError) {
                            checkSendError(pError, params, function() {
                                var lName = path.basename(p.name);
                                sendMsg(params, 'save', lName);
                            });
                        }
                    });
                break;
                
            case 'DELETE':
                onDelete(params, lQuery, function(msg) {
                    sendMsg(params, 'delete', msg);
                });
                break;
            }
        }
        
        return ret;
    }
    
    function onDelete(params, query, callback) {
        var p = params;
        
        if (query === 'dir')
            fs.rmdir(p.name, function(error) {
                checkSendError(error, params, function() {
                    Util.exec(callback, p.name);
                });
            });
        else if (query === 'files') {
            getBody(p.request, function(pBody) {
                var i, name,
                    lFiles  = Util.parseJSON(pBody),
                    n       = lFiles.length,
                    lDir    = p.name,
                    log     = Util.log.bind(Util),
                    lAssync = 0;
                
                function onStat(name, error, stat) {
                    ++lAssync;
                    
                    checkSendError(error, params, function() {
                        if (stat.isDirectory())
                            fs.rmdir(name, log);
                        
                        else if (stat.isFile())
                            fs.unlink(name, log);
                    });
                    
                    if (lAssync === n && !error)
                        Util.exec(callback, pBody);
                }
                
                for (i = 0; i < n; i ++) {
                    name = lDir + lFiles[i];
                    
                    Util.log(name);
                    
                    fs.stat(name, onStat.bind(null, name));
                }
            });
        } else
            fs.unlink(p.name, function(error) {
                checkSendError(error, params, function() {
                    Util.exec(callback, p.name);
                });
            });
    }
    
    function onFSGet(query, name, callback) {
        var msg, hash, ret = true;
        
        switch (query) {
        case 'size':
            dir.getSize(name, function(error, size) {
                if (!error)
                    size = CloudFunc.getShortSize(size);
                
                Util.exec(callback, error, size);
            });
            break;
            
        case 'time':
            time.get(name, function(error, time) {
                var timeStr = time.toString();
                Util.exec(callback, error, timeStr);
            });
            break;
            
        case 'hash':
            hash = Hash.create();
            
            if (!hash) {
                msg    = 'not suported, try update node';
                msg    = CloudFunc.formatMsg('hash', msg, 'error');
                Util.exec(callback, msg);
            } else
                pipe.create({
                    from        : name,
                    write       : hash,
                    callback    : function (error) {
                        var hex = hash.get();
                        Util.exec(callback, error, hex);
                    }
                });
            break;
        
        default:
            ret = false;
            break;
        }
        
        return ret;
    }
    
    /**
     * process data on GET request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onGET(pParams) {
        var ret = main.checkParams(pParams);
        if (ret) {
            var p       = pParams,
                lCmd    = p.command;
            
            switch(lCmd) {
            case '':
                p.data = {
                    info: 'Cloud Commander API v1'
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
        
        return ret;
    }
    
    /**
     * process data on PUT request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onPUT(pParams) {
        var name, data, json, config,
            ret        = main.checkParams(pParams, ['body']);
        
        if (ret) {
            var p       = pParams,
                lCmd    = p.command,
                lFiles  = Util.parseJSON(p.body);
            
            switch(lCmd) {
            case 'auth':
                main.auth(p.body, function(pTocken) {
                    send({
                        response: p.response,
                        data: pTocken
                    });
                });
                break;
            
            case 'mv':
                if (!Util.checkObjTrue(lFiles, ['from', 'to']) )
                    sendError(pParams, p.data);
                else
                    fs.rename(lFiles.from, lFiles.to, function(pError) {
                         checkSendError(pError, pParams, function() {
                            sendResponse(pParams);
                         });
                    });
                    
                break;
            
            case 'cp':
                 if (!Util.checkObjTrue(lFiles, ['from', 'to']))
                    sendError(pParams, p.data);
                else
                    pipe.create({
                        from        : lFiles.from,
                        to          : lFiles.to,
                        callback    : function(pError) {
                            if (pError)
                                sendError(pParams, pError);
                            else
                                sendMsg(pParams, 'copy', lFiles.to);
                        }
                    });
                
                break;
            
            case 'zip':
                if (!Util.checkObjTrue(lFiles, ['from']))
                    sendError(pParams, p.data);
                else
                    pipe.create({
                        from        : lFiles.from,
                        to          : lFiles.to || lFiles.from + '.zip',
                        gzip        : true,
                        callback    : function(pError) {
                            checkSendError(pError, pParams, function() {
                                var lName = path.basename(lFiles.from);
                                sendMsg(pParams, 'zip', lName);
                            });
                        }
                    });
                    
                break;
            
            case 'config':
                var hash,
                    passwd  = lFiles.password,
                    sha     = crypto.createHash('sha1');
                    config  = main.config;
                
                if (passwd) {
                    sha.update(passwd);
                    passwd          = sha.digest('hex');
                    lFiles.password = passwd;
                }
                
                for (name in lFiles)
                    config[name] = lFiles[name];
                
                json = Util.stringifyJSON(config) + '\n';
                
                fs.writeFile(JSONDIR + 'config.json', json, function(error) {
                     checkSendError(error, pParams, function() {
                        sendMsg(pParams, 'config', name);
                     });
                });
                
                break;
            
            default:
                send(pParams);
                break;
            }
        }
        
        return ret;
    }
    
    /**
     * get body of url query
     *
     * @param pReq
     * @param pCallBack
     */
    function getBody(req, pCallBack) {
        var lBody = '';
        
        req.on('data', function(chunk) {
            lBody += chunk.toString();
        });
        
        req.on('end', function() {
            Util.exec(pCallBack, lBody);
        });
    }
    
    function sendMsg(pParams, pMsg, pName, pStatus) {
        var msg = CloudFunc.formatMsg(pMsg, pName, pStatus);
        sendResponse(pParams, msg);
    }
    
    function checkSendError(error, params, callback) {
        if (error)
            sendError(params, error);
        else
            Util.exec(callback);
    }
    
})();

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
             '# and apiURL in config.json'                      + '\n'  +
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
        }),
        
        fse         = main.require('fs-extra') || {
            remove  : fs.rmdir.bind(fs),
            mkdirs  : fs.mkdir.bind(fs),
            copy    : function(from, to, callback) {
                pipe.create({
                        from        : from,
                        to          : to,
                        callback    : callback
                    });
            }
        };
        
    /**
     * rest interface
     * @pParams {request, responce}
     */
    exports.api = function(request, response, callback) {
        var apiURL, name, ret;
        
        if (request && response) {
            apiURL  = main.config.apiURL;
            name    = main.getPathName(request);
            ret     = Util.isContainStr(name, apiURL);
            
            if (ret) {
                name = Util.removeStrOneTime(name, apiURL) || '/';
                sendData({
                    request     : request,
                    response    : response,
                    name        : name
                });
            }
        }
        if (!ret)
            Util.exec(callback);
        
        return ret;
    };
    
    /**
     * send data
     * 
     * @param pRes
     * @param pData
     */
    function send(params) {
        var res     = params.response,
            data    = params.data,
            str     = Util.stringifyJSON(data);
        
        res.writeHead(OK, Header);
        res.end(str);
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
        var p, query, isGet,
            ret     = main.checkParams(params);
        
        if (ret) {
            p       = params;
            query   = main.getQuery(p.request);
            p.name  = Util.removeStrOneTime(p.name, CloudFunc.FS) || '/';
            
            switch (p.request.method) {
            case 'GET':
                onFSGet(query, p.name, function(error, data, isFile) {
                    var str;
                    
                    if (error)
                        sendError(params, error);
                    else if (isFile)
                        main.sendFile(p);
                    else {
                        p.name += '.json';
                        str     = Util.stringifyJSON(data);
                        sendResponse(p, str);
                    }
                });
            
            break;
                
            case 'PUT':
                onFSPut(p.name, query, p.request, function(error, msg) {
                    if (error)
                        sendError(params, error);
                    else
                        sendResponse(params, msg);
                });
                break;
                
            case 'DELETE':
                getBody(p.request, function(body) {
                    var files   = Util.parseJSON(body);
                    
                    onDelete(p.name, files, query, function(error, callback) {
                        checkSendError(error, params, function() {
                            var names = files.length ? files : p.name;
                            
                            if (callback)
                                Util.exec(callback);
                            else
                                sendMsg(params, 'delete', names);
                        });
                    });
                });
                break;
            }
        }
        
        return ret;
    }
    
    function onFSPut(name, query, readStream, callback) {
        var func        = Util.retExec(callback),
            baseName    = path.basename(name);
        
        switch(query) {
        case 'dir':
            fse.mkdirs(name, function(error) {
                var msg;
                
                if (!error)
                    msg = CloudFunc.formatMsg('make dir', name);
                
                func(error, msg);
            });
            break;
        
        default:
            pipe.create({
                read        : readStream,
                to          : name,
                callback    : function(error) {
                    var msg;
                    
                    if (!error)
                        msg     = CloudFunc.formatMsg('save', baseName);
                    
                    func(error, msg);
                }
            });
            break;
        
        case 'patch':
            getBody(readStream, function(patch) {
                fs.readFile(name, 'utf8', read);
                
                function read(error, data) {
                    var diffResult;
                    
                    if (error)
                        func(error);
                    else {
                        error         = Util.tryCatchLog(function() {
                            diffResult = diff.applyPatch(data, patch);
                        });
                        
                        if (diffResult && !error)
                            fs.writeFile(name, diffResult, write);
                        else {
                            msg     = CloudFunc.formatMsg('patch', baseName, 'fail');
                            func(null, msg);
                        }
                    }
                }
                
                function write(name, error) {
                    var msg;
                    
                    if (!error)
                        msg = CloudFunc.formatMsg('patch', baseName);
                    
                    func(error, msg);
                }
            });
            break;
    }
    }
    
    function onDelete(name, files, query, callback) {
        var i, n, onStat,
            assync  = 0,
            rmFile  = fs.unlink.bind(fs),
            rmDir   = fse.remove.bind(fse),
            func    = Util.retExec(callback);
        
        switch(query) {
        default:
            rmFile(name, func);
            break;
        
        case 'dir':
            rmDir(name, func);
            break;
        
        case 'files':
            n       = files && files.length,
            dir     = name;
            
            onStat  = function(name, error, stat) {
                var log     = Util.log.bind(Util);
                ++assync;
                
                if (error)
                    func(error);
                else {
                    if (stat.isDirectory())
                        rmDir(name, log);
                    
                    else if (stat.isFile())
                        rmFile(name, log);
                    
                    if (assync === n)
                        func();
                }
            };
            
            for (i = 0; i < n; i ++) {
                name = dir + files[i];
                Util.log(name);
                fs.stat(name, onStat.bind(null, name));
            }
            break;
        }
    }
    
    function onFSGet(query, name, callback) {
        var error, hash,
            func    = Util.retExec(callback);
        
        switch (query) {
        case 'size':
            dir.getSize(name, function(error, size) {
                if (!error)
                    size = CloudFunc.getShortSize(size);
                
                func(error, size);
            });
            break;
            
        case 'time':
            time.get(name, function(error, time) {
                var timeStr;
                
                if (!error)
                    timeStr = time.toString();
                
                func(error, timeStr);
            });
            break;
            
        case 'hash':
            hash = Hash.create();
            
            if (!hash) {
                error   = 'not suported, try update node';
                error   = CloudFunc.formatMsg('hash', error, 'error');
                func(error);
            } else
                pipe.create({
                    from        : name,
                    write       : hash,
                    callback    : function (error) {
                        var hex;
                        
                        if (!error)
                            hash = hash.get();
                        
                        func(error, hash);
                    }
                });
            break;
        
        default:
            fs.stat(name, function(error, stat) {
                var getDirContent   = main.commander.getDirContent,
                    isDir           = stat && stat.isDirectory();
                
                if (isDir && !error)
                    getDirContent(name, func);
                else
                    func(error, null, !isDir);
            });
            break;
        }
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
        var name, data, json, config, callback,
            ret        = main.checkParams(pParams, ['body']);
        
        if (ret) {
            var p       = pParams,
                lCmd    = p.command,
                lFiles  = Util.parseJSON(p.body);
            
            console.log(lFiles);
            
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
                callback = function(error) {
                    checkSendError(error, pParams, function() {
                        sendMsg(pParams, 'copy', lFiles.to);
                    });
                };
                
                if (!Util.checkObjTrue(lFiles, ['from', 'to']))
                    sendError(pParams, p.data);
                else
                    fse.copy(lFiles.from, lFiles.to, callback);
                
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
                    passwd  = lFiles && lFiles.password,
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
     * @param req
     * @param callback
     */
    function getBody(req, callback) {
        var body = '';
        
        req.on('data', function(chunk) {
            body += chunk.toString();
        });
        
        req.on('end', function() {
            Util.exec(callback, body);
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

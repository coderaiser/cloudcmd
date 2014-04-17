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
        crypto      = main.crypto,
        Util        = main.util,
        pipe        = main.pipe,
        CloudFunc   = main.cloudfunc,
        dir         = main.dir,
        
        onFSGet     = main.srvrequire('rest/fs/get').onGet,
        onFSPut     = main.srvrequire('rest/fs/put').onPut,
        onDelete    = main.srvrequire('rest/fs/delete').onDelete,
        markdown    = main.srvrequire('rest/markdown'),
        
        JSONDIR     = main.JSONDIR,
        OK          = 200,
        sendError   = main.sendError,
        sendResponse= main.sendResponse,
        Header      = main.generateHeaders({
            name:'api.json'
        }),
        rimraf      = main.require('rimraf'),
        ncp         = main.srvrequire('ncp'),
        
        NOT_LOG     = true,
        
        fse         = {
            copy    : ncp || function(from, to, callback) {
                pipe.create({
                    from        : from,
                    to          : to,
                    callback    : callback
                });
            },
            delete  : rimraf || function(path, callback) {
                dir.isDir(path, function(error, isDir) {
                    if (error)
                        callback(error);
                    else if (isDir)
                        fs.rmdir(path, callback);
                    else
                        fs.unlink(path, callback);
                });
            },
            move    : function(from, to, callback) {
                if (ncp && rimraf)
                    ncp(from, to, function() {
                        rimraf(from, callback);
                    });
                else
                    fs.rename(from, to, callback);
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
    function sendData(params) {
        var p, isFS, isMD,
            ret     = main.checkParams(params);
        
        if (ret) {
            p       = params;
            isFS    = Util.isContainStrAtBegin(p.name, CloudFunc.FS),
            isMD    = Util.isContainStrAtBegin(p.name, '/markdown');
            
            if (isFS)
                onFS(params);
            else if (isMD)
                markdown.operate(p.name, p.request, function(error, data) {
                    if (error)
                        sendError(p, error);
                    else
                        sendResponse(p, data, NOT_LOG);
                });
            else {
                if (p.name[0] === '/')
                    p.command = Util.removeStrOneTime(p.name, '/');
                
                switch(p.request.method) {
                case 'GET':
                    ret = onGET(params);
                    break;
                    
                case 'PUT':
                    pipe.getBody(p.request, function(error, body) {
                        if (error)
                            sendError(params, error);
                        else {
                            p.body = body;
                            onPUT(params);
                        }
                    });
                    break;
                }
            }
        }
        return ret;
    }
    
    function onFS(params) {
        var p, query,
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
                        sendResponse(p, str, NOT_LOG);
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
                pipe.getBody(p.request, function(error, body) {
                    var files;
                    
                    if (error)
                        sendError(p, error);
                    else {
                        files   = Util.parseJSON(body);
                        
                        onDelete(p.name, files, query, function(error, callback) {
                            var names;
                            
                            if (error)
                                sendError(params,error);
                            else {
                                names = (files && files.length) ? files : p.name;
                                
                                if (callback)
                                    Util.exec(callback);
                                else
                                    sendMsg(params, 'delete', names);
                            }
                        });
                    }
                });
                break;
            }
        }
        
        return ret;
    }
    
    /**
     * process data on GET request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onGET(pParams) {
        var p, cmd, json, ret = main.checkParams(pParams);
        if (ret) {
            p   = pParams,
            cmd = p.command;
            
            switch(cmd) {
            case '':
                p.data = {
                    info: 'Cloud Commander API v1'
                };
                send(p);
                break;
            
            default:
                json = Util.stringifyJSON({
                    error: 'command not found'
                });
                
                sendError(p, json);
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
    function onPUT(params) {
        var p, cmd, files, name, json, config, data,
            ret         = main.checkParams(params, ['body']);
        
        if (ret) {
            p       = params,
            cmd     = p.command,
            files   = Util.parseJSON(p.body);
            
            switch(cmd) {
            case 'auth':
                main.auth(p.body, function(error, token) {
                    if (error)
                        sendError(p, error);
                    else
                        send({
                            response: p.response,
                            data: token
                        });
                });
                break;
            
            case 'mv':
                if (!Util.checkObjTrue(files, ['from', 'to']) )
                    sendError(params, p.data);
                else {
                    
                    if (files.names)
                        data    = Util.slice(files.names);
                    else
                        data    = files;
                        
                    copyFiles(files,
                        function(path, callback) {
                            fse.delete(path, function(error) {
                                if (error)
                                    sendError(params, error);
                                else
                                    callback();
                            });
                        },
                        
                        function(error) {
                            if (error)
                                sendError(params, error);
                            else
                                sendMsg(params, 'move', data);
                        });
                }
                
                break;
            
            case 'cp':
                if (!Util.checkObjTrue(files, ['from', 'names', 'to']))
                    sendError(params, p.data);
                else {
                    files.namesAll    = Util.slice(files.names);
                    copyFiles(files, null, function(error) {
                        if (error)
                            sendError(params, error);
                        else
                            sendMsg(params, 'copy', files.namesAll);
                    });
                }
                break;
            
            case 'zip':
                if (!Util.checkObjTrue(files, ['from']))
                    sendError(params, p.data);
                else
                    pipe.create({
                        from        : files.from,
                        to          : files.to || files.from + '.zip',
                        gzip        : true,
                        callback    : function(error) {
                            var name = path.basename(files.from);
                            
                            if (error)
                                sendError(params, error);
                            else
                                sendMsg(params, 'zip', name);
                        }
                    });
                    
                break;
            
            case 'unzip':
                if (!Util.checkObjTrue(files, ['from']))
                    sendError(params, p.data);
                else
                    pipe.create({
                        from        : files.from,
                        to          : files.to || Util.removeStrOneTime(files.from, ['.zip', '.gzip']),
                        gunzip       : true,
                        callback    : function(error) {
                            var name = path.basename(files.from);
                            
                            if (error)
                                sendError(params, error);
                            else
                                sendMsg(params, 'unzip', name);
                        }
                    });
                    
                break;
            
            case 'config':
                var passwd  = files && files.password,
                    sha     = crypto.createHash('sha1');
                    config  = main.config;
                
                if (passwd) {
                    sha.update(passwd);
                    passwd          = sha.digest('hex');
                    files.password = passwd;
                }
                
                for (name in files)
                    config[name] = files[name];
                
                json = Util.stringifyJSON(config) + '\n';
                
                fs.writeFile(JSONDIR + 'config.json', json, function(error) {
                    if (error)
                        sendError(params, error);
                    else
                        sendMsg(params, 'config', name);
                });
                
                break;
            
            default:
                send(params);
                break;
            }
        }
        
        return ret;
    }
    
    function copyFiles(files, callbackProcess, callback) {
        var names           = files.names,
            isFunc          = Util.isFunction(callbackProcess),
            processFunc     = names ? fse.copy : fs.rename,
            
            copy            = function() {
                var isLast, name, process,
                    from    = files.from,
                    to      = files.to;
                
                if (names) {
                    isLast  = !names.length,
                    name    = names.shift(),
                    from    += name;
                    to      += name;
                } else {
                    isLast  = false;
                    names   = [];
                }
                
                process = Util.retExec(callbackProcess, from);
                
                if (isLast)
                    Util.exec(callback, null);
                else
                    processFunc(from, to, function(error) {
                        if (error)
                            Util.exec(callback, error);
                        else
                            Util.ifExec(!isFunc, copy, process);
                    });
            };
        
        copy();
    }
    
    function sendMsg(sendParam, msgParam, dataParam, status) {
        var msg, data,
            isObj = Util.isObject(dataParam);
        
        if (isObj)
            data = Util.stringifyJSON(dataParam);
        else
            data = dataParam;
            
        msg = CloudFunc.formatMsg(msgParam, data, status);
        
        sendResponse(sendParam, msg);
    }
    
})();

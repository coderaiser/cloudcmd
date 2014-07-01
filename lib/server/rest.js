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
        
        DIR         = './',
        
        flop        = require(DIR + 'flop'),
        pack        = require(DIR + 'pack'),
        mellow      = require(DIR + 'mellow'),
        format      = require(DIR + 'format'),
        
        NOT_LOG     = true;
        
        
    /**
     * rest interface
     * @pParams {request, responce}
     */
    exports.api = function(request, response, callback) {
        var apiURL, name, ret;
        
        if (request && response) {
            apiURL  = CloudFunc.apiURL;
            name    = main.getPathName(request);
            ret     = Util.isContainStr(name, apiURL);
            
            if (ret) {
                name = Util.rmStrOnce(name, apiURL) || '/';
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
                    p.command = Util.rmStrOnce(p.name, '/');
                
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
        var p, query, path,
            ret     = main.checkParams(params);
        
        if (ret) {
            p       = params;
            query   = main.getQuery(p.request);
            p.name  = Util.rmStrOnce(p.name, CloudFunc.FS) || '/';
            path    = mellow.convertPath(p.name);
            
            switch (p.request.method) {
            case 'GET':
                onFSGet(query, path, function(error, data) {
                    var str,
                        isStr   = Util.isString(data),
                        params  = {
                            gzip: true,
                            name: path,
                            request: p.request,
                            response: p.response,
                        };
                    
                    if (error) {
                        if (error.code === 'ENOTDIR')
                            main.sendFile(params);
                        else
                            sendError(params, error);
                    } else {
                        data.path = format.addSlashToEnd(p.name);
                        params.name += '.json';
                        params.query = query;
                        
                        if (isStr)
                            str = data;
                        else
                            str = Util.stringifyJSON(data);
                        
                        sendResponse(params, str, NOT_LOG);
                    }
                });
            
            break;
                
            case 'PUT':
                onFSPut(query, path, p.request, function(error, msg) {
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
                        
                        onDelete(query, path, files, function(error) {
                            var names;
                            
                            if (error) {
                                sendError(params,error);
                            } else {
                                if (files && files.length)
                                    names = files;
                                else
                                    names = p.name;
                                
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
            
            case 'config':
                main.sendFile({
                    name    : JSONDIR + 'config.json',
                    request : p.request,
                    response: p.response,
                    cache   : false
                });
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
        var p, cmd, files, name, json, config, data, from, to,
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
                if (!files.from || !files.to) {
                    sendError(params, p.data);
                } else {
                    files.from  = mellow.convertPath(files.from);
                    files.to    = mellow.convertPath(files.to);
                    
                    if (files.names)
                        data    = Util.slice(files.names);
                    else
                        data    = files;
                        
                    copyFiles(files, flop.move, function(error) {
                            if (error)
                                sendError(params, error);
                            else
                                sendMsg(params, 'move', data);
                        });
                }
                
                break;
            
            case 'cp':
                if (!files.from || !files.names || !files.to) {
                    sendError(params, p.data);
                } else {
                    files.from  = mellow.convertPath(files.from);
                    files.to    = mellow.convertPath(files.to);
                    
                    files.namesAll    = Util.slice(files.names);
                    copyFiles(files, flop.copy, function(error) {
                        if (error)
                            sendError(params, error);
                        else
                            sendMsg(params, 'copy', files.namesAll);
                    });
                }
                break;
            
            case 'zip':
                if (!files.from) {
                    sendError(params, p.data);
                } else {
                    from    = mellow.convertPath(files.from);
                    to      = mellow.convertPath(files.to);
                    
                    if (!to)
                        to  = from + '.zip';
                    
                    pack.gzip(from, to, function(error) {
                        var name = path.basename(files.from);
                        
                        if (error)
                            sendError(params, error);
                        else
                            sendMsg(params, 'zip', name);
                    });
            }
                break;
            
            case 'unzip':
                if (!files.from) {
                    sendError(params, p.data);
                } else {
                    from    = mellow.convertPath(files.from);
                    to      = mellow.convertPath(files.to);
                    
                    if (!to)
                        to      = Util.rmStrOnce(files.from, ['.zip', '.gzip']);
                    
                  pack.gunzip(from, to, function(error) {
                        var name = path.basename(files.from);
                        
                        if (error)
                            sendError(params, error);
                        else
                            sendMsg(params, 'unzip', name);
                    });
                }
                    
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
    
    function copyFiles(files, processFunc, callback) {
        var names           = files.names,
            
            copy            = function() {
                var isLast, name,
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
                
                if (isLast)
                    callback();
                else
                    processFunc(from, to, function(error) {
                        if (error)
                            callback(error);
                        else
                            copy();
                    });
            };
        
        Util.checkArgs(arguments, ['files', 'processFunc', 'callback']);
        
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

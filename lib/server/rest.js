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
        
        NOT_LOG     = true,
        
        fse         = main.require('fs-extra') || {
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
        var p, isFS, isMD,
            ret     = main.checkParams(pParams);
        
        if (ret) {
            p       = pParams;
            isFS    = Util.isContainStrAtBegin(p.name, CloudFunc.FS),
            isMD    = Util.isContainStrAtBegin(p.name, '/markdown');
            
            if (isFS)
                onFS(pParams);
            else if (isMD)
                markdown.operate(p.request, function(error, data) {
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
                    ret = onGET(pParams);
                    break;
                    
                case 'PUT':
                    pipe.getBody(p.request, function(pBody) {
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
                pipe.getBody(p.request, function(body) {
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
    function onPUT(pParams) {
        var name, data, json, config, callback,
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

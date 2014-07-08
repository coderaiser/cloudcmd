(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        
        socket          = main.socket,
        update          = main.srvrequire('update'),
        
        exec            = main.child_process.exec,
        spawn           = main.child_process.spawn,
        
        Util            = main.util,
        path            = main.path,
        CloudFunc       = main.cloudfunc,
        mainpackage     = main.mainpackage,
        equalPart       = Util.isContainStrAtBegin,
        CLOUDCMD        = mainpackage.name,
        ClientFuncs     = [],
        ClientDirs      = [],
        Clients         = [],
        WIN32           = main.WIN32,
        
        addNewLine      = CloudFunc.addNewLine,
        
        ConNum          = 0,
        
        CHANNEL         = CloudFunc.CHANNEL_CONSOLE,
        
        HELP            = {
            stdout  : CLOUDCMD + ' exit     \n' +
                      CLOUDCMD + ' update   \n',
        };
    
    /**
     * function listen on servers port
     * @pServer {Object} started server object
     */
    exports.init = function() {
        var ret;
        
        ret = socket.on('connection', function(clientSocket) {
            onConnection(clientSocket, function(json) {
                socket.emit(CHANNEL, json, clientSocket);
            });
        });
        
        return ret;
    };
    
    function onConnection(clientSocket, callback) {
        var msg, onDisconnect, onMessage;
        
        ++ConNum;
        
        if (!Clients[ConNum]) {
            msg = log(ConNum, 'console connected');
            
            callback({
                stdout  : addNewLine(msg),
                path    : process.cwd()
            });
            
            Clients[ConNum]             = true;
            
            onMessage                   = Util.exec.with(getOnMessage, ConNum, callback);
            onDisconnect                = function(conNum) {
                Clients[conNum]         =
                ClientFuncs[conNum]     = null;
                
                log(conNum, 'console disconnected');
                
                socket.removeListener(CHANNEL, onMessage, clientSocket);
                socket.removeListener('disconnect', onDisconnect, clientSocket);
            }.bind(null, ConNum);
            
            socket.on(CHANNEL, onMessage, clientSocket);
            socket.on('disconnect', onDisconnect, clientSocket);
        } else {
            msg = log(ConNum, ' in use. Reconnecting...\n');
            
            Util.exec(callback, {
                stdout: msg
            });
            
            socket.disconnect();
        }
    }
    
    /**
     * function gets onMessage function 
     * that execute needed command
     * 
     * @param pConnNum
     * @param callback
     */
    function getOnMessage(connNum, callback, command) {
        var funcExec, firstChar,
            connName, ret, isContain,
            
            isVolume    = isChangeWinVolume(command),
            
            symbolsExec = ['*', '&', '{', '}', '|', '\'', '"'],
            CWD         = process.cwd(),
            dir         = ClientDirs[connNum],
            options     = {
                cwd:    dir || CWD
            };
        
        if (!dir)
            dir = ClientDirs[connNum] = CWD;
        
        connName = '#' + connNum + ': ';
        Util.log(connName + command);
        
        if (equalPart(command, CLOUDCMD)) 
            ret = onCloudCmd(command, callback);
        else if (equalPart(command, 'cd ') || isVolume) {
            ret = true;
            
            onCD(command, dir, function(error, json) {
                var path  = '';
                
                if (!error) {
                    path                = json.path;
                    ClientDirs[connNum] = path;
                }
                
                callback(json);
            });
        }
        
        if (!ret) {
            if (WIN32)
                command    = 'cmd /C ' + command;
            
            if (!ClientFuncs[connNum])
                ClientFuncs[connNum] = Util.exec.with(setExec, function(json, error, stderr) {
                    log(connNum, error, 'error');
                    log(connNum, stderr, 'stderror');
                    
                    Util.exec(callback, json);
                });
            
            funcExec        = ClientFuncs[connNum];
            isContain       = Util.isContainStr(command, symbolsExec);
            firstChar       = command[0];
            
            if (firstChar === '#') {
                command     = command.slice(1);
                command     = connName + command;
                command     = addNewLine(command);
                
                Util.exec(callback, { 
                    stdout: command
                }, true);
            } else if (WIN32 || firstChar === ' ' || isContain)
                exec(command, options, funcExec);
            else
                setSpawn(command, options, callback);
        }
    }
    
    
    /**
     * function send result of command to client
     * @param callback
     */
    function setExec(callback, error, stdout, stderr) {
        var json,
            errorStr    = stderr || error;
        
        if (errorStr)
            errorStr    = addNewLine(errorStr + '');
        
        json            = {
            stdout : stdout,
            stderr : errorStr
        };
        
        Util.exec(callback, json, error, stderr);
    }
    
    function setSpawn(сommand, options, callback) {
        var cmd, error,
            isSended    = false,
            args        = сommand.split(' '),
            send        = function(error, data) {
                isSended = true;
                
                callback({
                    stderr: error,
                    stdout: data
                });
            },
            sendError     = function(error) {
                if (!isSended) {
                    isSended = true;
                    send(error, null);
                }
            };
        
        сommand    = args.shift();
        
        error       = Util.exec.tryLog(function() {
            cmd = spawn(сommand, args, options);
        });
        
        if (error) {
            sendError(error);
        } else {
            cmd.stderr.setEncoding('utf8');
            cmd.stdout.setEncoding('utf8');
            
            cmd.stdout.on('data', function(data) {
                send(null, data);
            });
            
            cmd.stderr.on('data', function(error) {
                sendError(error);
            });
            
            cmd.on('error', function(error) {
                var errorStr    = addNewLine(error + '');
                
                Util.log(error);
                sendError(errorStr);
            });
            
            cmd.on('close', function () {
                cmd = null;
                
                if (!isSended)
                    send(null, null);
            });
        }
    }
    
    function onCloudCmd(command, callback) {
        var is;
        
        command = Util.rmStr(command, CLOUDCMD);
        is      = !equalPart(command, ' ');
        
        if (is) {
            Util.exec(callback, HELP);
        } else {
            command = Util.rmStr(command, ' ');
            is  = update && equalPart(command, 'update');
            
            if (is) {
                update.get();
                
                Util.exec(callback, {
                    stdout: addNewLine('update: ok')
                });
            }
            
            is = Util.strCmp(command, 'exit');
            
            if (is)
                process.exit();
        }
        
        return is;
    }
    
     function onCD(command, currDir, callback) {
        var isChangeVolume  = isChangeWinVolume(command),
            isVolume        = isWinVolume(command),
            paramDir        = Util.rmStr(command, 'cd '),
            isRootOrHome    = equalPart(paramDir, ['/', '~']),
            getDir          = WIN32 ? 'chdir' : 'pwd';
        
        if (!isRootOrHome && !isChangeVolume || isVolume)
            command     = 'cd ' + path.join(currDir, paramDir);
        
        exec(command + ' && ' + getDir, {cwd : currDir}, function (error, stdout, stderr) {
            var errorStr    = '',
                errorData   = stderr || error,
                isStr       = Util.isString(errorData);
            
            if (errorData && !isStr)
                errorStr    = Util.stringifyJSON(errorData);
            else
                errorStr    = errorData;
            
            callback(errorData, {
                stderr  : errorStr,
                path    : CloudFunc.rmNewLine(stdout)
            });
        });
    }
    
    function isWinVolume(command) {
        var is, winVolume;
        
        if (WIN32) {
            winVolume   = new RegExp('^[a-z]{1}:\\\\.*', 'i');
            is          = command.match(winVolume);
        }
        
        return is;
    }
    
    function isChangeWinVolume(command) {
        var is, winVolume;
        
        if (WIN32) {
            winVolume   = new RegExp('^[a-z]{1}:$', 'i');
            is          = command.match(winVolume);
        }
        
        return is;
    }
    
    function log(connNum, str, typeParam) {
        var ret, 
            type       = ' ';
        
        if (str) {
            
            if (typeParam)
                type  += typeParam + ':';
            
            ret        = 'client #' + connNum + type + str;
            
            Util.log(ret);
        }
        
        return ret;
    }
})();

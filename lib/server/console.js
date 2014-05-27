(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        DIR             = main.DIR,
        
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
        ConNum          = 0,
        
        CHANNEL         = CloudFunc.CHANNEL_CONSOLE,
        
        HELP            = {
            stdout  : CLOUDCMD + ' exit     \n' +
                      CLOUDCMD + ' update   \n',
        },
        
        /* windows commands thet require 
         * unicode charset on locales 
         * different then English
         */
        Win32Commands   = ['ASSOC', 'AT', 'ATTRIB', 'BREAK', 'CACLS', 'CALL',
                            'CD', 'CHCP', 'CHDIR', 'CHKDSK', 'CHKNTFS', 'CLS',
                            'CMD', 'COLOR', 'COMP', 'COMPACT', 'CONVERT', 'COPY',
                            'DATE', 'DEL', 'DIR', 'DISKCOMP', 'DISKCOPY', 'DOSKEY',
                            'ECHO', 'ENDLOCAL', 'ERASE', 'EXIT', 'FC', 'FIND',
                            'FINDSTR', 'FOR', 'FORMAT', 'FTYPE', 'GOTO', 'GRAFTABL',
                            'HELP', 'IF', 'LABEL', 'MD', 'MKDIR', 'MODE', 'MORE',
                            'MOVE', 'PATH', 'PAUSE', 'POPD', 'PRINT', 'PROMPT',
                            'PUSHD', 'RD', 'RECOVER', 'REM', 'REN', 'RENAME',
                            'REPLACE', 'RMDIR', 'SET', 'SETLOCAL', 'SHIFT', 'SORT',
                            'START', 'SUBST', 'TIME', 'TITLE', 'TREE', 'TYPE',
                            'VER', 'VERIFY', 'VOL', 'XCOPY'];
    
    /**
     * function listen on servers port
     * @pServer {Object} started server object
     */
    exports.init = function() {
        var ret;
        
        ret = socket.on('connection', function(clientSocket) {
            onConnection(clientSocket, function(json, all) {
                socket.emit(CHANNEL, json, clientSocket, all);
            });
        });
        
        return ret;
    };
    
    function onConnection(clientSocket, callback) {
        var msg, onDisconnect, onMessage;
        
        ++ConNum;
        
        if (!Clients[ConNum]) {
            msg = log(ConNum, 'console connected');
            
            Util.exec(callback, {
                stdout : msg
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
        var winCommand, funcExec, firstChar,
            connName, ret, isContain,
            
            symbolsExec = ['*', '&', '{', '}', '|', '\'', '"'],
            dir         = ClientDirs[connNum],
            options     = {
                cwd:    dir || DIR
            };
        
        if (!dir)
            dir = ClientDirs[connNum] = DIR;
        
        connName = '#' + connNum + ': ';
        Util.log(connName + command);
        
        if (equalPart(command, CLOUDCMD)) 
            ret = onCloudCmd(command, callback);
        else if (equalPart(command, 'cd '))  {
            ret = true;
            
            onCD(command, dir, function(json) {
                var error   = json.stderr,
                    stdout  = json.stdout;
                
                if (error)
                    Util.exec(callback, json);
                else
                    ClientDirs[connNum] = stdout;
            });
        }
            
        if (!ret) {
            /* if we on windows and command is build in
             * change code page to unicode becouse
             * windows use unicode on non English versions
             */
            if (WIN32) {
                winCommand     = command.toUpperCase();
                
                if (Win32Commands.indexOf(winCommand) >= 0)
                    command    = 'chcp 65001 |' + command;
            }
            
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
                command     = CloudFunc.addNewLine(command);
                
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
                errorStr    = CloudFunc.addNewLine(errorStr + '');
            
            json            = {
                stdout : stdout,
                stderr : errorStr
            };
            
            Util.exec(callback, json, error, stderr);
    }
    
    function setSpawn(сommand, options, callback) {
        var cmd, error,
            args        = сommand.split(' '),
            send        = function(error, data) {
                var exec    = {
                        stderr: error,
                        stdout: data
                    };
                
                Util.exec(callback, exec);
            },
            sendError     = function(error) {
                send(error + '', null);
            };
        
        сommand    = args.shift();
        
        error       = Util.exec.tryLog(function() {
            cmd = spawn(сommand, args, options);
        });
        
        if (error) {
            sendError(error);
        } else {
            cmd.stdout.on('data', function(data) {
                send(null, data + '');
            });
            
            cmd.stderr.on('data', sendError);
            cmd.on('error', function(error) {
                var addNewLine  = CloudFunc.addNewLine,
                    errorStr    = addNewLine(error + '');
                
                Util.log(error);
                sendError(errorStr);
            });
            
            cmd.on('close', function () {
                cmd = null;
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
                    stdout: CloudFunc.addNewLine('update: ok')
                });
            }
            
            is = Util.strCmp(command, 'exit');
            
            if (is)
                process.exit();
        }
        
        return is;
    }
    
    function onCD(command, currDir, callback) {
        var dir,
            getDir      = WIN32 ? 'chdir' : 'pwd',
            paramDir    = Util.rmStr(command, 'cd ');
        
        if (equalPart(paramDir, ['/', '~']))
            dir = paramDir;
        else
            dir = path.join(currDir, paramDir);
        
        exec('cd ' + dir + ' && ' + getDir, function (error, stdout, stderr) {
            var errorStr    = '',
                errorData   = error || stderr;
            
            if (errorData)
                errorStr    = Util.stringifyJSON(errorData);
            
            Util.exec(callback, {
                stderr  : errorStr,
                stdout  : CloudFunc.rmNewLine(stdout)
            });
        });
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

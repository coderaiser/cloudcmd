(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        DIR             = main.DIR,
        SRVDIR          = main.SRVDIR,
        
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
            msg = log(ConNum, 'connected\n');
            
            Util.exec(callback, {
                stdout : msg
            });
            
            Clients[ConNum]             = true;
            
            onMessage                   = getOnMessage(ConNum, callback);
            onDisconnect                = function(conNum) {
                Clients[conNum]         =
                ClientFuncs[conNum]     = null;
                
                log(conNum, 'disconnected');
                
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
    function getOnMessage(pConnNum, callback) {
        return function(pCommand) {
            var lWinCommand, lExec_func, firstChar,
                connName,
                lError, lRet, lExecSymbols, isContain,
                dir, options = {};
            
            dir = ClientDirs[pConnNum];
            
            if (!dir)
                dir = ClientDirs[pConnNum] = DIR;
            
            connName = '#' + pConnNum + ': ';
            Util.log(connName + pCommand);
            
            if (equalPart(pCommand, CLOUDCMD)) 
                lRet = onCloudCmd(pCommand, callback);
            else if (equalPart(pCommand, 'cd '))  {
                lRet = true;
                
                onCD(pCommand, dir, function(json) {
                    var error   = json.stderr,
                        stdout  = json.stdout;
                    
                    if (error)
                        Util.exec(callback, json);
                    else
                        ClientDirs[pConnNum] = stdout;
                });
            }
                
            if (!lRet) {
                /* if we on windows and command is build in
                 * change code page to unicode becouse
                 * windows use unicode on non English versions
                 */
                if (WIN32) {
                    lWinCommand     = pCommand.toUpperCase();
                    
                    if (Win32Commands.indexOf(lWinCommand) >= 0)
                        pCommand    = 'chcp 65001 |' + pCommand;
                }
                
                if (!ClientFuncs[pConnNum])
                    ClientFuncs[pConnNum] = getExec(function(json, pError, pStderr) {
                        log(pConnNum, pError, 'error');
                        log(pConnNum, pStderr, 'stderror');
                        
                        Util.exec(callback, json);
                    });
                
                lExec_func      = ClientFuncs[pConnNum];
                lExecSymbols    = ['*', '&', '{', '}', '|', '\'', '"'];
                isContain       = Util.isContainStr(pCommand, lExecSymbols);
                firstChar       = pCommand[0];
                options.cwd     = dir;
                
                if (firstChar === '#') {
                    pCommand    = pCommand.slice(1);
                    pCommand    = connName + pCommand;
                    pCommand    = Util.addNewLine(pCommand);
                    
                    Util.exec(callback, { 
                        stdout: pCommand
                    }, true);
                } else if (WIN32 || firstChar === ' ' || isContain)
                    exec(pCommand, options, lExec_func);
                else
                    getSpawn(pCommand, options, callback);
            }
        };
    }
    
    
    /**
     * function send result of command to client
     * @param callback
     */
    function getExec(callback) {
        return function(pError, pStdout, pStderr) {
            var lErrorStr, lExecStr, lExec,
                lError          = pStderr || pError;
            
            if (lError) {
                if (Util.isString(lError))
                    lErrorStr   = lError;
                else
                    lErrorStr   = lError.toString();
                    
                lErrorStr = Util.addNewLine(lErrorStr);
            }
            
            lExec               = {
                stdout : pStdout,
                stderr : lErrorStr || lError
            };
            
            Util.exec(callback, lExec, pError, pStderr);
        };
    }
    
    function getSpawn(pCommand, options, callback) {
        var send, cmd, error,
            args    = pCommand.split(' ');
        
        pCommand    = args.shift();
        
        error       = Util.tryCatchLog(function() {
            cmd = spawn(pCommand, args, options);
        });
        
        if (!cmd)
            send(error + '', null);
        else {
            send        = function(error, data) {
                var exec    = {
                        stderr: error,
                        stdout: data
                    };
                
                Util.exec(callback, exec);
            };
            
            cmd.stdout.on('data', function(data) {
                send(null, data + '');
            });
            
            cmd.stderr.on('data', function(error) {
                send(error + '', null);
            });
            
            cmd.on('error', Util.retFalse);
            cmd.on('close', function (code) {
                cmd = null;
            });
        }
    }
    
    function onCloudCmd(pCommand, callback) {
        var lRet;
        
        pCommand = Util.removeStr(pCommand, CLOUDCMD);
        
        if (!equalPart(pCommand, ' ')) {
            lRet = true;
            Util.exec(callback, HELP);
        }
        else {
            pCommand = Util.removeStr(pCommand, ' ');
            
            if (equalPart(pCommand, 'update') && update) {
                lRet = true;
                update.get();
                
                Util.exec(callback, {
                    stdout: Util.addNewLine('update: ok')
                });
            }
            
            if (Util.strCmp(pCommand, 'exit'))
                process.exit();
        }
        
        return lRet;
    }
    
    function onCD(pCommand, currDir, callback) {
        var dir,
            getDir      = WIN32 ? 'chdir' : 'pwd',
            paramDir    = Util.removeStr(pCommand, 'cd ');
        
        if (equalPart(paramDir, ['/', '~']))
            dir = paramDir;
        else
            dir = path.join(currDir, paramDir);
        
        exec('cd ' + dir + ' && ' + getDir, function (error, stdout, stderr) {
            var lRet,
                lMsg    = '',
                lError = error || stderr;
            
            if (lError) {
                lError  = Util.stringifyJSON(lError);
                lMsg    = lError;
            }
            
            Util.exec(callback, {
                stderr  : lMsg,
                stdout  : Util.rmNewLine(stdout)
            });
        });
    }
    
    
    function log(pConnNum, pStr, pType) {
        var lRet, 
            lType       = ' ';
        
        if (pStr) {
            
            if (pType)
                lType  += pType + ':';
            
            lRet        = 'client #' + pConnNum + lType + pStr;
            
            Util.log(lRet);
        }
        
        return lRet;
    }
})();

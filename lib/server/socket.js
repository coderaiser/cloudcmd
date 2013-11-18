/* module make possible connectoin thru socket.io on a server */

(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        DIR             = main.DIR,
        SRVDIR          = main.SRVDIR,
        
        io              = main.require('socket.io'),
        update          = main.srvrequire('update'),
        exec            = main.child_process.exec,
        Util            = main.util,
        path            = main.path,
        mainpackage     = main.mainpackage,
        equalPart       = Util.isContainStrAtBegin,
        CLOUDCMD        = mainpackage.name,
        ClientFuncs     = [],
        ClientDirs      = [],
        OnMessageFuncs  = [],
        INFO_LOG_LEVEL  = 2,
        ENV             = process.env,
        WIN32           = main.WIN32,
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
    exports.listen = function(pServer) {
        var lRet, lConnNum, lMsg, lConn_func;
        
        if (io) {
            io          = io.listen(pServer);
            lConnNum    = 0;
            
            io.set('log level', INFO_LOG_LEVEL);
            
            /* 
             * on Win7 application is crashing, 
             * when options below is used.
             * 
             * https://github.com/LearnBoost/socket.io/issues/1314
             *
             */
            if (!WIN32) {
                io.enable('browser client minification');
                io.enable('browser client gzip');
                io.enable('browser client etag');
            }
            
            io.set('transports', [
              'websocket',
              'htmlfile',
              'xhr-polling',
              'jsonp-polling'
            ]);
            
            lRet = io.sockets.on('connection', function (socket) {
                ++lConnNum;
                
                if(!OnMessageFuncs[lConnNum]) {
                    lMsg    = log(lConnNum, 'connected\n');
                    
                    jsonSend(socket, {
                        stdout : lMsg
                    });
                    
                    OnMessageFuncs[lConnNum]    = onMessage(lConnNum, socket);
                    lConn_func                  = OnMessageFuncs[lConnNum];
                    
                    socket.on('message', lConn_func);
                    socket.on('disconnect', Util.call(disconnect, lConnNum));
                } else {
                    lMsg = log(lConnNum, ' in use. Reconnecting...');
                    
                    jsonSend(socket, {
                        stdout: lMsg
                    });
                    
                    socket.disconnect();
                }
                
            });
        }
        
        return lRet;
    };
    
    function disconnect(pParams) {
        var lConnNum, lRet = Util.checkObj(pParams, ['params']);
        
        if(lRet) {
            lConnNum = pParams.params;
            OnMessageFuncs  [lConnNum]  =
            ClientFuncs     [lConnNum]  = null;
            
            log(lConnNum, 'disconnected');
        }
        
    }
    
    /**
     * function gets onMessage function 
     * that execute needed command
     * 
     * @param pConnNum, pSocket
     */
    function onMessage(pConnNum, pSocket) {
        return function(pCommand) {
            var lMsg, lWinCommand, lExec_func, firstChar,
                connName,
                lError, lRet, lExecSymbols, isContain,
                dir, options = {};
            
            dir = ClientDirs[pConnNum];
            
            if (!dir)
                dir = ClientDirs[pConnNum] = DIR;
            
            connName = '#' + pConnNum + ': ';
            Util.log(connName + pCommand);
            
            if (equalPart(pCommand, CLOUDCMD)) 
                lRet = onCloudCmd(pCommand, function(json) {
                     jsonSend(pSocket, json);
                });
            else if (equalPart(pCommand, 'cd '))  {
                lRet = true;
                
                onCD(pCommand, dir, function(json) {
                    var error   = json.stderr,
                        stdout  = json.stdout;
                    
                    if (error)
                        jsonSend(pSocket, json);
                    else
                        ClientDirs[pConnNum] = stdout;
                });
            }
                
            if (!lRet) {
                /* if we on windows and command is build in
                 * change code page to unicode becouse
                 * windows use unicode on non English versions
                 */
                if(WIN32) {
                    lWinCommand     = pCommand.toUpperCase();
                    
                    if (Win32Commands.indexOf(lWinCommand) >= 0)
                        pCommand    = 'chcp 65001 |' + pCommand;
                }
                
                if(!ClientFuncs[pConnNum])
                    ClientFuncs[pConnNum] = getExec(function(json, pError, pStderr) {
                        log(pConnNum, pError, 'error');
                        log(pConnNum, pStderr, 'stderror');
                        
                        jsonSend(pSocket, json);
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
                    
                    lMsg    = Util.stringifyJSON({ 
                        stdout: pCommand
                    });
                    
                    io.sockets.emit('message', lMsg);
                } else if (WIN32 || firstChar === ' ' || isContain)
                    exec(pCommand, options, lExec_func);
                else
                    getSpawn(pCommand, options, function(json) {
                        jsonSend(pSocket, json);
                    });
            }
        };
    }
    
    
    /**
     * function send result of command to client
     * @param pSocket
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
        var send, cmd, spawn,
            args    = pCommand.split(' ');
        
        pCommand    = args.shift();
        
        spawn       = main.child_process.spawn;
        cmd         = spawn(pCommand, args, options);
        send        = function(data, isError) {
            var lExec               = {},
                msg                 = data.toString();
                
            if (isError)
                lExec.stderr    = msg;
            else
                lExec.stdout    = msg;
            
            Util.exec(callback, lExec);
        };
        
        cmd.stdout.on('data', send);
        
        cmd.stderr.on('data', function(data) {
            send(data, true);
        });
        
        cmd.on('error', Util.retFalse);
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
        
        if (equalPart(paramDir, ['/', '~', '.']))
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
    
    function jsonSend(socket, json) {
        var msg = Util.stringifyJSON(json);
        socket.send(msg);
    }
})();

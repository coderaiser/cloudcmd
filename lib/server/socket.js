/* module make possible connectoin thru socket.io on a server */

(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        SRVDIR          = main.SRVDIR,
        
        io              = main.require('socket.io'),
        update          = main.srvrequire('update'),
        exec            = main.child_process.exec,
        Util            = main.util,
        mainpackage     = main.mainpackage,
        CLOUDCMD        = mainpackage.name,
        ClientFuncs     = [],
        OnMessageFuncs  = [],
        INFO_LOG_LEVEL  = 2,
        WIN32           = main.WIN32,
        
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
            io     = io.listen(pServer),
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
                lError, lRet, lExecSymbols, isContain;
            
            connName = '#' + pConnNum + ': ';
            Util.log(connName + pCommand);
            
            if (Util.isContainStrAtBegin(pCommand, CLOUDCMD)) 
                lRet = onCloudCmd(pCommand, pSocket);
            else if( Util.isContainStrAtBegin(pCommand, 'cd ') ) 
                lRet = onCD(pCommand, pSocket);
            
            if (!lRet) {
                /* if we on windows and command is build in
                 * change code page to unicode becouse
                 * windows use unicode on non English versions
                 */
                if(WIN32) {
                    lWinCommand = pCommand.toUpperCase();
                    
                    if( Win32Commands.indexOf(lWinCommand) >= 0 )
                        pCommand = 'chcp 65001 |' + pCommand;
                }
                
                if(!ClientFuncs[pConnNum])
                    ClientFuncs[pConnNum] = getExec(pSocket, pConnNum);
                
                lExec_func      = ClientFuncs[pConnNum];
                lExecSymbols    = ['*', '&', '{', '}', '|', '\'', '"'];
                isContain       = Util.isContainStr(pCommand, lExecSymbols);
                firstChar       = pCommand[0];
                
                if (firstChar === '#') {
                    pCommand    = pCommand.slice(1);
                    pCommand    = connName + pCommand;
                    pCommand    = Util.addNewLine(pCommand);
                    
                    lMsg    = Util.stringifyJSON({ 
                        stdout: pCommand
                    });
                    
                    io.sockets.emit('message', lMsg);
                } else if (firstChar === ' ' || isContain)
                    exec(pCommand, lExec_func);
                else
                    getSpawn(pSocket, pConnNum, pCommand);
            }
        };
    }
    
    
    /**
     * function send result of command to client
     * @param pSocket
     */
    function getExec(pSocket, pConnNum) {
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
            
            log(pConnNum, pError, 'error');
            log(pConnNum, pStderr, 'stderror');
            
            jsonSend(pSocket, lExec);
        };
    }
    
    function getSpawn(pSocket, pConnNum, pCommand) {
        var send, cmd, spawn,
            args    = pCommand.split(' ');
        
        pCommand    = args.shift();
        
        spawn       = main.child_process.spawn;
        cmd         = spawn(pCommand, args);
        send        = function(data, isError) {
            var lExec               = {},
                msg                 = data.toString();
                
            if (isError)
                lExec.stderr    = msg;
            else
                lExec.stdout    = msg;
            
            jsonSend(pSocket, lExec);
        };
        
        cmd.stdout.on('data', send);
        
        cmd.stderr.on('data', function(data) {
            send(data, true);
        });
        
        cmd.on('error', Util.retFalse);
    }
    
    function onCloudCmd(pCommand, pSocket) {
        var lRet;
        
        pCommand = Util.removeStr(pCommand, CLOUDCMD);
        
        if( Util.isContainStrAtBegin(pCommand, ' ') ) {
            pCommand = Util.removeStr(pCommand, ' ');
            
            if( Util.isContainStrAtBegin(pCommand, 'update') && update ) {
                update.get();
                lRet = true;
            }
            
            if( Util.strCmp(pCommand, 'exit') )
                if(WIN32)
                    pCommand = 'taskkill -f /PID ' + process.pid;
                else
                    pCommand = 'kill -9 ' + process.pid;
        }
        else {
            jsonSend(pSocket, {
                stdout  : CLOUDCMD + ' exit     \n' +
                          CLOUDCMD + ' update   \n',
                stderr  : null
            });
            
            lRet = true;
        }
        
        return lRet;
    }
    
    function onCD(pCommand, pSocket) {
        var lRet, lDir, lHome, lError;
        
        lDir    = Util.removeStr(pCommand, 'cd ');
        lHome   = process.env.HOME;
        
        if ( Util.isContainStr(lDir, '~') )
            lDir = Util.replaceStr(lDir, '~', lHome);
        
        lError = Util.tryCatchLog(function() {
            process.chdir(lDir);
        });
        
        if (!lError) 
            lRet = true;
        else {
            lError = Util.stringifyJSON(lError);
            
            jsonSend(pSocket, {
                stderr: lError
            });
        }
    }
    
    
    function log(pConnNum, pStr, pType) {
        var lRet, lType = ' ';
        
        if (pStr) {
            
            if (pType)
                lType += pType + ':';
            
            lRet = 'client #' + pConnNum + lType + pStr;
            
            Util.log(lRet);
        }
        
        return lRet;
    }
    
    function jsonSend(socket, json) {
        var msg = Util.stringifyJSON(json);
        console.log(msg);
        socket.send(msg);
    }
})();

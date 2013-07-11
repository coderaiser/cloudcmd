/* module make possible connectoin thru socket.io on a server */

(function(){
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
    exports.listen = function(pServer){
        var lRet, lListen, lConnNum, lMsg, lConn_func;
        
        if(io){
            lListen     = io.listen(pServer),
            lConnNum    = 0;
            
            lListen.set('log level', INFO_LOG_LEVEL);
            lListen.set('browser client minification', true);
            lListen.set('browser client gzip', true);
            
            lRet = lListen.sockets.on('connection', function (socket){
                ++lConnNum;
                
                if(!OnMessageFuncs[lConnNum]) {
                    lMsg = log(lConnNum, 'connected');
                    socket.send('{"stdout":"' + lMsg + '"}');
                    
                    OnMessageFuncs[lConnNum]    = onMessage(lConnNum, socket);
                    lConn_func                  = OnMessageFuncs[lConnNum];
                    
                    socket.on('message', lConn_func);
                    socket.on('disconnect', Util.call(disconnect, lConnNum));
                } else {
                    lMsg = log(lConnNum, ' in use. Reconnecting...');
                    socket.send('{"stdout":"' + lMsg + '"}');
                    socket.disconnect();
                }
                
            });
        }
        
        return lRet;
    };
    
    function disconnect(pParams){
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
    function onMessage(pConnNum, pSocket){
        return function(pCommand) {
            var lMsg, lWinCommand, lExec_func;
            
            Util.log('#' + pConnNum + ': ' + pCommand);
            
            if( Util.isContainStrAtBegin(pCommand, CLOUDCMD) ) {
                pCommand = Util.removeStr(pCommand, CLOUDCMD);
                
                if( Util.isContainStrAtBegin(pCommand, ' ') ){
                    pCommand = Util.removeStr(pCommand, ' ');
                    
                    if( Util.isContainStrAtBegin(pCommand, 'update') && update )
                        update.get();
                    
                    if( Util.strCmp(pCommand, 'exit') )
                        if(WIN32)
                            pCommand = 'taskkill -f /PID ' + process.pid;
                        else
                            pCommand = 'kill -9 ' + process.pid;
                }
                else {
                    lMsg = {
                        stdout  : CLOUDCMD + ' exit     \n' +
                                  CLOUDCMD + ' update   \n',
                        stderr  : null
                    };
                    
                    lMsg = JSON.stringify(lMsg);
                    pSocket.send(lMsg);
                    
                    Util.log('received from client: ' + pCommand);
                    Util.log('sended to client: ' + lMsg);
                }
            } else if( Util.isContainStrAtBegin(pCommand, 'cd ') ) {
                pCommand = Util.removeStr(pCommand, 'cd ');
            }
            
            /* if we on windows and command is build in
             * change code page to unicode becouse
             * windows use unicode on non English versions
             */
            if(WIN32){
                lWinCommand = pCommand.toUpperCase();
                
                if( Win32Commands.indexOf(lWinCommand) >= 0 )
                    pCommand = 'chcp 65001 |' + pCommand;
            }
            
            if(!ClientFuncs[pConnNum])
                ClientFuncs[pConnNum] = getExec(pSocket, pConnNum);
            
            lExec_func = ClientFuncs[pConnNum];
            
            exec(pCommand, lExec_func);
        };
    }
    
    
    /**
     * function send result of command to client
     * @param pSocket
     */
    function getExec(pSocket, pConnNum){
        return function(pError, pStdout, pStderr) {
            var lExec       = {
                    stdout : pStdout,
                    stderr : pStderr || pError
                },            
                
                lExec_str   = JSON.stringify(lExec);
            
            log(pConnNum, pError, 'error');
            log(pConnNum, pStderr, 'stderror');
            
            pSocket.send(lExec_str);
        };
    }
    
    function log(pConnNum, pStr, pType){
        var lRet, lType = ' ';
        
        if (pStr) {
            
            if (pType)
                lType += pType + ':';
            
            lRet = 'client #' + pConnNum + lType + pStr;
            
            Util.log(lRet);
        }
        
        return lRet;
    }
})();

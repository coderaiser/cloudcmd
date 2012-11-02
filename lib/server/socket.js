/* module make possible connectoin thrue socket.io on a server */

var DIR             = process.cwd() + '/',
    main            = require(DIR + 'lib/server/main.js'),
    SRVDIR          = main.SRVDIR,
    
    srvfunc         = require(SRVDIR + 'srvfunc'),
    
    io              = srvfunc.require('socket.io'),
    update          = srvfunc.require(SRVDIR + 'update'),
    exec            = main.child_process.exec,
    
    ClientFuncs     = [],
    OnMessageFuncs  = [],
    Win32_b         = srvfunc.isWin32;

/**
 * function listen on servers port
 * @pServer {Object} started server object
 */
exports.listen = function(pServer){
    io = io.listen(pServer);
    
    /* number of connections */
    var lConnNum = 0;
    io.sockets.on('connection', function (socket){
        ++lConnNum;
        socket.send('{"stdout":"client connected"}');
        
        console.log('server connected');
        
        if(!OnMessageFuncs[lConnNum])
            OnMessageFuncs[lConnNum] = onMessage(lConnNum, socket);
        
        var lConn_func = OnMessageFuncs[lConnNum];
        
        socket.on('message', lConn_func);
        
    });
};

/**
 * function gets onMessage function 
 * that execute needed command
 * 
 * @param pConnNum, pSocket
 */
function onMessage(pConnNum, pSocket){
    return function(pCommand) {
            console.log(pCommand);
            
            if( pCommand.indexOf('cloudcmd') === 0 ){
                pCommand = pCommand.replace('cloudcmd', '');
                
                if(pCommand.indexOf(' ') === 0){
                    pCommand = pCommand.replace(' ','');
                    
                    if(pCommand.indexOf('update') === 0){
                        if(update)
                            update.get();
                    }
                    
                    if(pCommand.indexOf('exit') === 0)
                        pCommand = 'kill -9 ' + process.pid;
                }
                else {
                    var lMsg = {
                        stdout : 'cloudcmd exit - for shutdown cloudcmd',
                        stderr : null
                    };
                    
                    lMsg = JSON.stringify(lMsg);
                    pSocket.send(lMsg);
                    
                    console.log('received from client: ' + pCommand);
                    console.log('sended to client: ' + lMsg);
                    
                    return;
                }
            }

            /* if we on windows and command is build in
             * change code page to unicode becouse
             * windows use unicode on non English versions
             */
            if(Win32_b){
                
                var lWinCommand = pCommand.toUpperCase();
                if( Win32Commands.indexOf(lWinCommand) > 0 )
                    pCommand = 'chcp 65001 |' + pCommand;
            }
            if(!ClientFuncs[pConnNum])
                ClientFuncs[pConnNum] = getExec(pSocket);
            
            var lExec_func = ClientFuncs[pConnNum];
            
            exec(pCommand, lExec_func);
        };
}


/**
 * function send result of command to client
 * @param pSocket
 */
function getExec(pSocket){
    return function(pError, pStdout, pStderr) {
        if (pError !== null) {
            console.log('exec error: ' + pError);
        }
    
        var lExec = {
            stdout : pStdout,
            stderr : pStderr || pError
        };        
        
        var lExec_str = JSON.stringify(lExec);        
        pSocket.send(lExec_str);
    };
}


/* windows commands thet require 
 * unicode charset on locales 
 * different then English
 */
var Win32Commands   = ['ASSOC', 'AT', 'ATTRIB', 'BREAK', 'CACLS', 'CALL',
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
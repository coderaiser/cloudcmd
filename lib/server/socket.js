/* module make possible connectoin thrue socket.io on a server */

var io              = require('socket.io'),
    exec            = require('child_process').exec,
    ClientFuncs     = [],
    OnMessageFuncs  = [],
    Win32_b         = process.platform === 'win32';

/**
 * Function listen on servers port
 * @pServer {Object} started server object
 */
exports.listen = function(pServer){
    io = io.listen(pServer);
    
    /* number of connections */
    var lConnNum = 0;
    io.sockets.on('connection', function (socket) {
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
            
            /* change code page to unicode */
            if(Win32_b)            
                pCommand = 'chcp 65001 |' + pCommand;
            
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
        console.log(lExec);
    };
}

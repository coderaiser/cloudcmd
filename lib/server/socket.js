/* module make possible connectoin thrue socket.io on a server */

var io          = require('socket.io'),
    exec        = require('child_process').exec,
    Socket      = {},
    charset     = require('lib/charset'),
    Win32_b     = false;
    
    if(process.platform === 'win32')
        Win32_b = true;

/**
 * Function listen on servers port
 * @pServer {Object} started server object
 */
exports.listen = function(pServer){
    io = io.listen(pServer);
    
    io.sockets.on('connection', function (socket) {
        Socket = socket;
        socket.send('hello from server!');
        
        console.log('server connected');
        
        socket.on('message', function(pCommand) {
            console.log(pCommand);
            
            exec(pCommand, getExec);
        });
        
    });
};


/**
 * function send result of command to client
 * @param error
 * @param stdout
 * @param stderr
 */
function getExec(error, stdout, stderr) {
    if(stdout){        
        if(Win32_b)
            stdout = charset.win2unicode(stdout);
            
        console.log(stdout);
        Socket.send(stdout);
    }
    if(stderr){
        if(Win32_b)
            stderr = charset.win2unicode(stderr);
            
        console.log('stderr: ' + stderr);
        Socket.send(stderr);
    }
    
    if (error !== null) {
        console.log('exec error: ' + error);
    }    
}
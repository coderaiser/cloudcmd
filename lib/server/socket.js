/* module make possible connectoin thrue socket.io on a server */

var io          = require('socket.io'),
    exec        = require('child_process').exec,
    Socket      = {},
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
            stdout = win2unicode(stdout);
            
        console.log(stdout);
        Socket.send(stdout);
    }
    if(stderr){
        if(Win32_b)
            stderr = win2unicode(stderr);
            
        console.log('stderr: ' + stderr);
        Socket.send(stderr);
    }
    
    if (error !== null) {
        console.log('exec error: ' + error);
    }    
}


/**
 * Windows-1251 to Unicode converter
 * Useful when having to use GET query parameters.
 * e.g. unescaped "%F2%E5%EA%F1%F2", "òåêñò" becomes "текст"
 * Source: http://xpoint.ru/know-how/JavaScript/PoleznyieFunktsii?38#PerekodirovkaIzWindows1251IKOI
 */
function win2unicode(str) {
   var charmap   = unescape(
      "%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F" +
      "%u0452%u2018%u2019%u201C%u201D%u2022%u2013%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F" +
      "%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407" +
      "%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457");
     
   var code2char = function(code) {
               if(code >= 0xC0 && code <= 0xFF) return String.fromCharCode(code - 0xC0 + 0x0410);
               if(code >= 0x80 && code <= 0xBF) return charmap.charAt(code - 0x80);
               return String.fromCharCode(code);
            };
            
   var res = "";
   
   for(var i = 0; i < str.length; i++) res = res + code2char(str.charCodeAt(i));
   
   return res;
};
/* module make possible connectoin thrue socket.io on a client */
var CloudCommander, io, socket;
(function(){
    "use strict";
    
    var cloudcmd    = CloudCommander,
        Util        = cloudcmd.Util,
        Term        = cloudcmd.Terminal.JqueryTerminal.Term;
    
    Util.jsload("/socket.io/lib/socket.io.js", {
        onload : function(){
            socket = io.connect(document.location.hostname);
            
            cloudcmd.Socket = socket;
            
            socket.on('connect', function () {
                console.log('socket connected');
            });
            
            socket.on('message', function (msg) {
                console.log(msg);
                Term.echo(msg);
            });
            
            socket.on('disconnect', function () {
                console.log('socket disconected');
            });
        },
        
        onerror : function(){
            console.log('could not connect to socket.io\n'+
                'npm i socket.io');
        }
    });
})();
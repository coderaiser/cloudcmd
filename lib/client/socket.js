/* module make possible connectoin thrue socket.io on a client */
var CloudCommander, io, socket;
(function(){
    "use strict";
    
    var cloudcmd        = CloudCommander,
        Util            = cloudcmd.Util,
        JqueryTerminal  = cloudcmd.Terminal.JqueryTerminal;
    
    Util.jsload("/socket.io/lib/socket.io.js", {
        onload : function(){
            socket = io.connect(document.location.hostname);
            
            cloudcmd.Socket = socket;
            
            socket.on('connect', function () {
                outToTerminal('socket connected');
            });
            
            socket.on('message', function (msg) {
                outToTerminal(msg);
              
            });
            
            socket.on('disconnect', function () {
                outToTerminal('socket disconected');
            });
        },
        
        onerror : function(){
            console.log('could not connect to socket.io\n'+
                'npm i socket.io');
        }
    });
    
    function outToTerminal(pMsg){
        var lTerm   = JqueryTerminal.Term,
            lResult = true;
        
        if(lTerm)
            lResult = lTerm.echo(pMsg);
        else
            lResult = lTerm;
        
        console.log(pMsg);
        
        return lResult;
    }
    
})();
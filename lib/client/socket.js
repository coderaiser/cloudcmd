/* module make possible connectoin thrue socket.io on a client */
var CloudCommander, io;
(function(){
    "use strict";
    
    var cloudcmd        = CloudCommander,
        Util            = cloudcmd.Util,
        Messages        = [],
        socket,
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
        
        if(lTerm){
            if(Messages.length){
                /* show oll msg from buffer */
                for(var i=0; i < Messages.length; i++)
                    lTerm.echo(Messages[i]);
                Messages = [];
            }
                
            lResult = lTerm.echo(pMsg);
        }
        else{
            /* if term not accesable
             * save msg to buffer
             */
            Messages.push(pMsg);
            lResult = false;
        }
        
        console.log(pMsg);
        
        return lResult;
    }
    
})();
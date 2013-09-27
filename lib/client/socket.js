/* module make possible connectoin thrue socket.io on a client */
var CloudCmd, Util, DOM, io;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    var Messages        = [],
        socket,
        Terminal,
        
        ERROR_MSG       = 'could not connect to socket.io\n'+
                          'npm i socket.io';
        
    DOM.jsload('/socket.io/lib/socket.io.js', {
        onerror : Util.retExec(Util.log, ERROR_MSG),
        onload  : connect
    });
    
    function connect() {
        socket = io.connect(CloudCmd.HOST, {
            'reconnect'                 : true,
            'reconnection delay'        : 500,
            'max reconnection attempts' : Math.pow(2, 64),
            'reconnect_failed'          : function() {
                Util.log('Could not reconnect. Reload page.');
            }
        });
        
        CloudCmd.Socket = socket;
        
        socket.on('connect', function () {
            outToTerminal({stdout: 'socket connected'});
        });
        
        socket.on('message', function (msg) {
            var lMsg = Util.parseJSON(msg);
            
            outToTerminal(lMsg);
          
        });
        
        socket.on('disconnect', function () {
            outToTerminal({stderr: 'socket disconected'});
        });
    }
        
    function outToTerminal(pMsg){
        var i, n, lResult, lStdout, lStderr,
            lConsole = CloudCmd.Console;
        DOM.Images.hideLoad();
        
        if( Util.isObject(lConsole) ){
            if(Messages.length){
                /* show oll msg from buffer */
                for(i = 0, n = Messages.length; i < n; i++){
                    lStdout = Messages[i].stdout;
                    lStderr = Messages[i].stderr;
                    
                    if(lStdout)
                        lConsole.log(lStdout);
                    
                    if(lStderr){
                        /* if it's object - convert is to string' */
                        if( Util.isObject(lStderr) )
                            lStderr =  Util.stringifyJSON(lStderr);
                            
                        lConsole.error(lStderr);
                    }
                }
                Messages = [];
            }
            
            lStdout = pMsg.stdout;
            lStderr = pMsg.stderr;
            
            if(lStdout)
                lResult = lConsole.log(lStdout);
                        
            if(lStderr && lStderr.code !== 1)
                lResult = lConsole.error(lStderr.toString());
        }
        else
            /* if term not accesable save msg to buffer */
            Messages.push(pMsg);
        
        Util.log(pMsg);
        
        return lResult;
    }
    
})(CloudCmd, Util, DOM);
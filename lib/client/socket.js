/* module make possible connectoin thrue socket.io on a client */
var CloudCommander, DOM, Util, io;
(function(CloudCmd, DOM, Util){
    'use strict';
    
    var Messages        = [],
        socket,
        JqueryTerminal;
        
    function getJqueryTerminal(){
        return CloudCmd.Terminal.JqueryTerminal;
    }
    
    DOM.jsload('/socket.io/lib/socket.io.js', {
        onload : function(){
            socket = io.connect(document.location.hostname);
            
            CloudCmd.Socket = socket;
            
            socket.on('connect', function () {
                JqueryTerminal = getJqueryTerminal();
                
                if(JqueryTerminal){
                    outToTerminal({stdout: 'socket connected'});
                
                    JqueryTerminal.Term.resume();
                }
            });
            
            socket.on('message', function (msg) {
                var lMsg = JSON.parse(msg);
                
                outToTerminal(lMsg);
              
            });
            
            socket.on('disconnect', function () {
                JqueryTerminal = getJqueryTerminal();
                
                if(JqueryTerminal){                
                    outToTerminal({stderr: 'socket disconected'});
                    
                    JqueryTerminal.Term.pause();
                }
            });
        },
        
        onerror : function(){
            console.log('could not connect to socket.io\n'+
                'npm i socket.io');
        }
    });
    
    function outToTerminal(pMsg){
        var lTerm,
            lResult = true;
        
        JqueryTerminal   = getJqueryTerminal();
        if(JqueryTerminal)
            lTerm = JqueryTerminal.Term;
        
        if(lTerm){
            var lStdout,
                lStderr;
            if(Messages.length){
                /* show oll msg from buffer */
                for(var i = 0, n = Messages.length; i < n; i++){
                    lStdout = Messages[i].stdout;
                    lStderr = Messages[i].stderr;
                    
                    if(lStdout)
                        lTerm.echo(lStdout);
                    
                    if(lStderr){
                        /* if it's object - convert is to string' */
                        if( Util.isObject(lStderr) )
                            lStderr = JSON.Stringify(lStderr);
                            
                        lTerm.error(lStderr);
                    }
                }
                Messages = [];
            }
            
            lStdout = pMsg.stdout;
            lStderr = pMsg.stderr;
            
            if(lStdout)
                lResult = lTerm.echo(lStdout);
                        
            if(lStderr && lStderr.code !== 1)
                lResult = lTerm.error(lStderr.toString());
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
    
})(CloudCommander, DOM, Util);
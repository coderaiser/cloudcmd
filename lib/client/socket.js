/* module make possible connectoin thrue socket.io on a client */
var CloudCmd, Util, DOM, io;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    var Messages        = [],
        socket,
        Terminal,
        
        ERROR_MSG       = 'could not connect to socket.io\n'+
                            'npm i socket.io';
        
    function getTerminal(){
        return CloudCmd.Terminal.JqueryTerminal;
    }
    
    DOM.jsload('/socket.io/lib/socket.io.js', {
        onerror : Util.retExec(Util.log, ERROR_MSG),
        
        onload  : function(){
            socket = io.connect(CloudCmd.HOST);
            
            CloudCmd.Socket = socket;
            
            socket.on('connect', function () {
                Terminal = getTerminal();
                
                if(Terminal){
                    outToTerminal({stdout: 'socket connected'});
                
                    Terminal.Term.resume();
                }
            });
            
            socket.on('message', function (msg) {
                var lMsg = Util.parseJSON(msg);
                
                outToTerminal(lMsg);
              
            });
            
            socket.on('disconnect', function () {
                Terminal = getTerminal();
                
                if(Terminal){
                    outToTerminal({stderr: 'socket disconected'});
                    
                    Terminal.Term.pause();
                }
            });
        }
    });
    
    function outToTerminal(pMsg){
        var lResult, lTerm;
        
        Terminal   = getTerminal();
        if(Terminal)
            lTerm = Terminal.Term;
        
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
                            lStderr =  Util.stringifyJSON(lStderr);
                            
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
        else
            /* if term not accesable save msg to buffer */
            Messages.push(pMsg);
        
        Util.log(pMsg);
        
        return lResult;
    }
    
})(CloudCmd, Util, DOM);
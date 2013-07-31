var CloudCmd, Util, DOM, $;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Console = new ConsoleProto(CloudCmd, Util, DOM);
        
    function ConsoleProto(CloudCmd, Util, DOM){
        var Name    = 'Console',
            jqconsole,
            Element,
            MouseBinded,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Console = this;
            
        this.init                = function(pCallBack) {
             var lFunc, lIsFunc = Util.isFunction(CloudCmd.View);
            
            if (lIsFunc)
                lFunc = CloudCmd.View;
            else
                lFunc = Util.exec;
            
            Util.loadOnLoad([
                Console.show,
                load,
                lFunc,
                DOM.jqueryLoad,
                DOM.socketLoad
            ]);
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('~', Console.show);
            
            delete Console.init;
        };
        
        this.show                       = function() {
            Images.showLoad({top:true});
            
            if (!Element) {
                Element         = DOM.anyload({
                    name        : 'div',
                    className   : 'console'
                });
                
                jqconsole           = $(Element).jqconsole('', '> ');
                // Abort prompt on Ctrl+Z.
                jqconsole.RegisterShortcut('Z', function() {
                    jqconsole.AbortPrompt();
                    handler();
                });
                
                // Handle a command.
                var handler = function(command) {
                    var lSocket = CloudCmd.Socket;
                    if (command) {
                        Images.showLoad({ top:true });
                        
                        if(lSocket)
                            lSocket.send(command);
                    }
                    
                    jqconsole.Prompt(true, handler);
                };
                
                // Initiate the first prompt.
                handler();
            }
            
            CloudCmd.View.show(Element, function(){
                var l$Console   = jqconsole.$console,
                    l$Input     = jqconsole.$input_source,
                    lFocus      = function(){
                        var x   = window.scrollX,
                            y   = window.scrollY;
                        
                        l$Input.focus();
                        window.scrollTo(x,y);
                    };
                
                lFocus();
                
                if (!MouseBinded) {
                    MouseBinded = true;
                    
                    $(l$Console).unbind('mouseup');
                    $(l$Console).mouseup(function() {
                        if( !window.getSelection().toString() ) {
                            var lTop        = l$Console.scrollTop();
                            
                            lFocus();
                            l$Console.scrollTop(lTop);
                        }
                    });
                }
            });
        };
        
        this.hide                       =  function(){
            CloudCmd.View.hide();
        };
        
        this.log                        = function(pText){
            if (jqconsole)
                jqconsole.Write( addNewLine(pText), 'log-msg');
        };
        
        this.error                      = function(pText){
            if (jqconsole)
                jqconsole.Write( addNewLine(pText), 'error-msg');
        };
        
        function addNewLine(pText){
            var lNewLine    = '',
                n           = pText && pText.length;
            
            if(n && pText[n-1] !== '\n')
                lNewLine = '\n';
            
            return pText + lNewLine;
        }
        
        
        function load(pCallBack){
            Util.time(Name + ' load');
            
            var lDir    =  CloudCmd.LIBDIRCLIENT + 'console/',
                lFiles  = [
                    lDir + 'jqconsole.js',
                    lDir + 'jqconsole.css',
                    lDir + 'ansi.css',
                    lDir + 'jquery-migrate-1.2.1.js'
                ];
            
            DOM.anyLoadInParallel(lFiles, function(){
                console.timeEnd(Name + ' load');
                
                Util.exec(pCallBack);
            });
        }
        
        function listener(pEvent){
            var lTRA        = Key.TRA,
                lESC        = Key.ESC,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
            switch(lKey){
                case lTRA:
                    if (lIsBind){
                        Console.show();
                        DOM.preventDefault(pEvent);
                    }
                    break;
                case lESC:
                    Console.hide();
                    break;
            }
            
        }
    }
    
})(CloudCmd, Util, DOM);

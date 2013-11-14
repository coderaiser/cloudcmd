var CloudCmd, Util, DOM, $;
(function(CloudCmd, Util, DOM) {
    'use strict';
    
    var Buffer   = {
            log     : '',
            error   : ''
        };
    
    CloudCmd.Console = ConsoleProto;
        
    function ConsoleProto(CallBack) {
        var Name    = 'Console',
            Loading,
            jqconsole,
            Element,
            MouseBinded,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Notify  = DOM.Notify,
            Console = this;
            
        function init() {
             var lFunc, lIsFunc = Util.isFunction(CloudCmd.View);
            
            Loading = true;
            
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
        }
        
        this.show                       = function() {
            if (!Loading) {
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
                
                CloudCmd.View.show(Element, function() {
                    var l$Console   = jqconsole.$console,
                        l$Input     = jqconsole.$input_source,
                        lFocus      = function() {
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
            }
        };
        
        this.hide                       =  function() {
            CloudCmd.View.hide();
        };
        
        this.log                        = function(pText) {
            log(pText, 'log');
        };
        
        this.error                      = function(pText) {
           log(pText, 'error');
        };
        
        function log(msg, status) {
            var ret;
            
            if (msg) {
                Buffer[status] += msg;
                ret             = Util.isContainStr(Buffer[status], '\n');
                
                if (jqconsole && ret) {
                    jqconsole.Write(Buffer[status], status + '-msg');
                    Notify.send(Buffer[status]);
                    Buffer[status] = '';
                }
            }
        }
        
        function load(pCallBack) {
            Util.time(Name + ' load');
            
            var lDir    =  CloudCmd.LIBDIRCLIENT + 'console/',
                lFiles  = [
                    lDir + 'jqconsole.js',
                    lDir + 'jqconsole.css',
                    lDir + 'ansi.css'
                ];
            
            DOM.anyLoadInParallel(lFiles, function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                
                Util.exec(pCallBack);
            });
        }
        
        function listener(pEvent) {
            var lTRA        = Key.TRA,
                lESC        = Key.ESC,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
            switch(lKey) {
                case lTRA:
                    if (lIsBind) {
                        Console.show();
                        DOM.preventDefault(pEvent);
                    }
                    break;
                case lESC:
                    Console.hide();
                    break;
            }
            
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM);

var CloudCmd, Util, DOM, CloudFunc, $;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    var Buffer   = {
            log     : '',
            error   : ''
        };
    
    CloudCmd.Console = ConsoleProto;
        
    function ConsoleProto(CallBack) {
        var Name    = 'Console',
            Messages= [],
            Loading,
            jqconsole,
            Element,
            MouseBinded,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Notify  = DOM.Notify,
            Console = this;
            
        function init() {
            Loading = true;
            
            Util.loadOnLoad([
                addListeners,
                CloudCmd.Socket,
                Console.show,
                load,
                CloudCmd.View,
                DOM.jqueryLoad,
            ]);
        }
        
        this.show                       = function(callback) {
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
                        var socket = CloudCmd.Socket;
                        
                        if (command && socket) {
                            Images.showLoad({ top:true });
                            socket.send(command);
                        }
                        
                        jqconsole.Prompt(true, handler);
                    };
                    
                    // Initiate the first prompt.
                    handler();
                }
                
                CloudCmd.View.show(Element, function() {
                    var console   = jqconsole.$console,
                        input     = jqconsole.$input_source,
                        
                        focus      = function() {
                            var x   = window.scrollX,
                                y   = window.scrollY;
                            
                            input.focus();
                            window.scrollTo(x,y);
                        };
                    
                    focus();
                    
                    if (!MouseBinded) {
                        MouseBinded = true;
                        
                        console.unbind('mouseup');
                        console.mouseup(function() {
                            var top,
                                isSelection = '' + window.getSelection();
                            
                            if (!isSelection) {
                                top        = console.scrollTop();
                                
                                focus();
                                console.scrollTop(top);
                            }
                        });
                    }
                    
                    Util.exec(callback);
                });
            }
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
                lCSS    = [
                    lDir + 'jqconsole.css',
                    lDir + 'ansi.css'
                ],
                lAllCSS = CloudFunc.getJoinURL(lCSS),
                lFiles  = [
                    lDir + 'jqconsole.js',
                    lAllCSS
                ];
            
            DOM.anyLoadInParallel(lFiles, function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                
                Util.exec(pCallBack);
            });
        }
        
        function addListeners(callback) {
            CloudCmd.Socket.on('message', function(msg) {
                var parsed = Util.parseJSON(msg);
                
                outToTerminal(parsed);
            });
            
            Util.exec(callback);
        }
        
        function outToTerminal(pMsg) {
            var i, n, lResult, lStdout, lStderr,
                lConsole = CloudCmd.Console;
            
            DOM.Images.hideLoad();
            
            if (Util.isObject(lConsole)) {
                if (Messages.length) {
                    /* show oll msg from buffer */
                    for (i = 0, n = Messages.length; i < n; i++) {
                        lStdout = Messages[i].stdout;
                        lStderr = Messages[i].stderr;
                        
                        if (lStdout)
                            lConsole.log(lStdout);
                        
                        if (lStderr) {
                            /* if it's object - convert is to string' */
                            if (Util.isObject(lStderr))
                                lStderr =  Util.stringifyJSON(lStderr);
                                
                            lConsole.error(lStderr);
                        }
                    }
                    Messages = [];
                }
                
                lStdout = pMsg.stdout;
                lStderr = pMsg.stderr;
                
                if (lStdout)
                    lResult = lConsole.log(lStdout);
                            
                if (lStderr)
                    lResult = lConsole.error(lStderr);
            }
            else
                Messages.push(pMsg);
            
            Util.log(pMsg);
            
            return lResult;
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

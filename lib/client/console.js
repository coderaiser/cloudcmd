var CloudCmd, Util, DOM, CloudFunc, $;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Console = ConsoleProto;
        
    function ConsoleProto(CallBack) {
        var Name    = 'Console',
            Buffer  = {
                log     : '',
                error   : ''
            },
            Loading,
            jqconsole,
            Element,
            MouseBinded,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Notify  = DOM.Notify,
            
            CHANNEL = CloudFunc.CHANNEL_CONSOLE,
            
            Console = this;
            
        function init() {
            Loading = true;
            
            Util.loadOnLoad([
                DOM.jqueryLoad,
                CloudCmd.View,
                load,
                Console.show,
                CloudCmd.Socket,
                addListeners,
            ]);
        }
        
        this.show   = show;
        this.log    = log;
        this.error  = error;
        
        function show(callback) {
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
                            socket.emit(CHANNEL, command);
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
        }
        
        function log(pText) {
            write(pText, 'log');
        }
        
        function error(pText) {
            write(pText, 'error');
        }
        
        function write(msg, status) {
            var isContain;
            
            if (msg) {
                Buffer[status] += msg;
                isContain       = Util.isContainStr(Buffer[status], '\n');
                
                if (jqconsole && isContain) {
                    jqconsole.Write(Buffer[status], status + '-msg');
                    Notify.send(Buffer[status]);
                    Buffer[status] = '';
                }
            }
        }
        
        function load(pCallBack) {
            Util.time(Name + ' load');
            
            var lDir    =  CloudCmd.LIBDIRCLIENT + 'console/',
                cssPath = lDir + 'css/',
                jsPath  = lDir + 'lib/',
                lCSS    = [
                    cssPath + 'jqconsole.css',
                    cssPath + 'ansi.css'
                ],
                lAllCSS = CloudFunc.getJoinURL(lCSS),
                lFiles  = [
                    jsPath + 'jqconsole.js',
                    lAllCSS
                ];
            
            DOM.anyLoadInParallel(lFiles, function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                
                Util.exec(pCallBack);
            });
        }
        
        function addListeners(callback) {
            var socket  = CloudCmd.Socket,
                options = {
                    'connect'   : function() {
                        log(socket.CONNECTED);
                    },
                    
                    'disconnect': function() {
                        error(socket.DISCONNECTED);
                    }
                };
            
            options[CHANNEL] = onMessage;
            
            socket.on(options);
            
            Util.exec(callback);
        }
        
        function onMessage(json) {
            if (json) {
                Util.log(json);
                log(json.stdout);
                error(json.stderr);
            }
            
            DOM.Images.hideLoad();
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

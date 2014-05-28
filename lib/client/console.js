var CloudCmd, Util, DOM, CloudFunc, $;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Console = ConsoleProto;
        
    function ConsoleProto() {
        var Name    = 'Console',
            Buffer  = {
                log     : '',
                error   : ''
            },
            Loading,
            jqconsole,
            
            log     = Util.exec.with(write, 'log'),
            error   = Util.exec.with(write, 'error'),
            
            Element,
            MouseBinded,
            Socket,
            Images  = DOM.Images,
            Notify  = DOM.Notify,
            
            CHANNEL = CloudFunc.CHANNEL_CONSOLE,
            
            Console = this;
            
        function init() {
            Loading = true;
            
            Util.exec.series([
                DOM.loadJquery,
                CloudCmd.View,
                load,
                CloudCmd.Socket,
                function(callback) {
                    Socket = CloudCmd.Socket;
                    Util.exec(callback);
                },
                Console.show,
                addListeners,
            ]);
        }
        
        this.show   = show;
        
        function show(callback) {
            if (!Loading) {
                Images.showLoad({top:true});
                
                if (!Element) {
                    Element         = DOM.load({
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
                        if (command) {
                            Images.showLoad({ top:true });
                            Socket.emit(CHANNEL, command);
                        }
                        
                        jqconsole.Prompt(true, handler);
                    };
                    
                    // Initiate the first prompt.
                    handler();
                }
                
                CloudCmd.View.show(Element, {
                    afterShow: function() {
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
                    }
                });
            }
        }
        
        function write(status, msg) {
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
        
        function load(callback) {
            var dir     =  CloudCmd.LIBDIRCLIENT + 'console/',
                jsPath  = dir + 'lib/',
                css     = [
                    '/css/console.css',
                    dir + 'css/ansi.css',
                ],
                cssAll  = CloudFunc.getJoinURL(css),
                files   = [
                    jsPath + 'jqconsole.js',
                    cssAll
                ];
            
            DOM.load.parallel(files, function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                
                Util.exec(callback);
            });
            
            Util.time(Name + ' load');
        }
        
        function addListeners(callback) {
            var options = {
                    'connect'   : function() {
                        log(Socket.CONNECTED);
                    },
                    
                    'disconnect': function() {
                        error(Socket.DISCONNECTED);
                    }
                };
            
            options[CHANNEL] = onMessage;
            
            Socket.on(options);
            
            Util.exec(callback);
        }
        
        function onMessage(json) {
            if (json) {
                Util.log(json);
                
                log(json.stdout);
                error(json.stderr);
            }
            
            DOM.Images.hide();
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

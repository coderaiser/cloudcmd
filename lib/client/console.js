var CloudCmd, Util, join, DOM, CloudFunc, $;

(function(CloudCmd, Util, join, DOM, CloudFunc) {
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
        this.clear  = clear;
        
        // Handle a command.
        function handler(command) {
            if (command)
                Socket.emit(CHANNEL, command);
            else
                jqconsole.Prompt(true, handler);
        }
        
        function show(callback) {
            if (!Loading) {
                Images.showLoad({top:true});
                
                if (!Element) {
                    Element         = DOM.load({
                        name        : 'div',
                        className   : 'console'
                    });
                    
                    jqconsole           = $(Element).jqconsole('', '> ');
                    
                    addShortCuts(jqconsole);
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
        
        function addShortCuts(jqconsole) {
            jqconsole.RegisterShortcut('Z', function() {
                jqconsole.SetPromptText('');
            });
            
            jqconsole.RegisterShortcut('L', clear);
            
            jqconsole.RegisterShortcut('P', function() {
                var command = jqconsole.GetPromptText();
                
                command     += DOM.getCurrentDirPath();
                jqconsole.SetPromptText(command);
            });
        }
        
        function clear() {
            jqconsole.Reset();
            addShortCuts(jqconsole);
            jqconsole.Prompt(true, handler);
        }
        
        function load(callback) {
            var dir     =  CloudCmd.LIBDIRCLIENT + 'console/',
                jsPath  = dir + 'lib/',
                
                css     = join([
                    '/css/console.css',
                    dir + 'css/ansi.css',
                ]),
                
                files   = [
                    jsPath + 'jqconsole.js',
                    css
                ];
            
            DOM.load.parallel(files, function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                
                Util.exec(callback);
            });
            
            Util.time(Name + ' load');
        }
        
        function isPrompt() {
            var state   = jqconsole.GetState(),
                is      = state === 'prompt';
            
            return is;
        }
        
        function addListeners(callback) {
            var options = {
                'connect'   : function() {
                    log(Socket.CONNECTED);
                },
                
                'disconnect': function() {
                    var is = isPrompt();
                    
                    error(Socket.DISCONNECTED);
                    
                    if (is)
                        jqconsole.AbortPrompt();
                }
            };
            
            options[CHANNEL] = onMessage;
            
            Socket.on(options);
            
            Util.exec(callback);
        }
        
        function onMessage(json) {
            var is = isPrompt();
            
            if (json) {
                Util.log(json);
                
                log(json.stdout);
                error(json.stderr);
                
                if (json.path)
                    jqconsole.SetPromptLabel(json.path + '> ');
            }
            
            if (!is)
                jqconsole.Prompt(true, handler);
        }
        
        init();
    }
    
})(CloudCmd, Util, join, DOM, CloudFunc);

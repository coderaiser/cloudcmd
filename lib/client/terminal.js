var CloudCmd, Util, DOM, CloudFunc, Terminal;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Terminal = TerminalProto;
        
    function TerminalProto() {
        var Name            = 'Terminal',
            Loading,
            Element,
            Term,
            Cell,
            Socket          = CloudCmd.Socket,
            Images          = DOM.Images,
            Size            = {
                cols: 0,
                rows: 0
            },
            
            CHANNEL         = CloudFunc.CHANNEL_TERMINAL,
            CHANNEL_RESIZE  = CloudFunc.CHANNEL_TERMINAL_RESIZE,
            
            CloudTerm       = this;
            
        function init() {
            Loading = true;
            
            Util.exec.series([
                DOM.loadJquery,
                CloudCmd.View,
                load,
                CloudCmd.Socket,
                /* rm view keys, it ruin terminal */
                function(callback) {
                    Socket = CloudCmd.Socket;
                    
                    Util.exec(callback);
                },
                CloudTerm.show,
                addListeners
            ]);
        }
        
        CloudTerm.show      = show;
        CloudTerm.write     = write;
        CloudTerm.hide      = function() {
            CloudCmd.View.hide();
        };
        
        function show(callback) {
            if (!Loading) {
                Images.showLoad({top:true});
                
                if (!Element) {
                    Element         = DOM.load({
                        name    : 'div',
                        id      : 'terminal',
                        style   : 'height :100%'
                    });
                    
                   /* hack to determine console size
                     * inspired with
                     * 
                     * https://github.com/petethepig/devtools-terminal
                     */
                    Cell            = DOM.load({
                        name    : 'div',
                        inner   : '&nbsp',
                        parent  : Element,
                        style   : 'position: absolute;' +
                                  'top      : -1000px;'
                    });
                    
                    DOM.load.style({
                        id      : 'terminal-css',
                        inner   : '.view {'   +
                                    'height'            + ': 100%;' +
                                '}'                                 +
                                  '.terminal-cursor {'              +
                                    'background'        + ': gray'  +
                                '}'
                    });
                    
                    Term    = new Terminal({
                        screenKeys: true,
                        cursorBlink: false,
                    });
                    
                    Term.open(Element);
                }
                
                CloudCmd.View.show(Element, {
                    onUpdate    : onResize,
                    afterShow   : afterShow.bind(null, callback)
                });
            }
        }
        
        function write(data) {
            Term.write(data);
        }
        
        function addListeners(callback) {
            var options = {
                    'connect': function() {
                        write(Socket.CONNECTED + '\r');
                    },
                    'disconnect': function() {
                        write(Socket.DISCONNECTED +'\r');
                    },
                };
            
            options[CHANNEL]        = write;
            options[CHANNEL_RESIZE] = function(size) {
                Term.resize(size.cols, size.rows);
            };
            
            Socket.on(options);
            
            Term.on('data', function(data) {
                Socket.emit(CHANNEL, data);
            });
            
            Term.on('resize', function(size) {
                Socket.emit(CHANNEL_RESIZE, size);
            });
            
            Util.exec(callback);
        }
        
        function getSize() {
            var wSubs   = Element.offsetWidth - Element.clientWidth,
                w       = Element.clientWidth - wSubs,
                
                hSubs   = Element.offsetHeight - Element.clientHeight,
                h       = Element.clientHeight - hSubs,
                
                x       = Cell.clientWidth,
                y       = Cell.clientHeight,
                
                cols    = Math.max(Math.floor(w / x), 10),
                rows    = Math.max(Math.floor(h / y), 10),
                
                size    = {
                    cols: cols,
                    rows: rows
                };
            
            return size;
        }
        
        function onResize() {
            var size    = getSize(),
                cols    = size.cols,
                rows    = size.rows;
            
            if (Size.cols !== cols || Size.rows !== rows) {
                Size = size;
                
                Term.emit('resize', size);
            }
        }
        
        function afterShow(callback) {
            Element.focus();
            Terminal.brokenBold = true;
            
            Util.exec(callback);
        }
        
        function load(callback) {
            var dir     =  CloudCmd.LIBDIRCLIENT + 'terminal/',
                path    = dir + 'term.js';
            
            Util.time(Name + ' load');
            
            DOM.load.js(path, function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                
                Util.exec(callback);
            });
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

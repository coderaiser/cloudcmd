var CloudCmd, Util, DOM, CloudFunc, Terminal, io;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Terminal = TerminalProto;
        
    function TerminalProto() {
        var Name            = 'Terminal',
            Loading,
            Element,
            Term,
            Cell,
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
                DOM.loadSocket,
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
                Images.show.load({top:true});
                
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
                        inner   : '.view, .terminal {'   +
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
            var href            = CloudCmd.HOST,
                FIVE_SECONDS    = 5000,
            
                socket = io.connect(href + '/terminal', {
                    'max reconnection attempts' : Math.pow(2, 32),
                    'reconnection limit'        : FIVE_SECONDS
                });
            
            socket.on('connect', function() {
                write('socket connected' + '\r');
            });
            
            socket.on('disconnect', function() {
                write('socket disconnected' +'\r');
            });
            
            socket.on(CHANNEL, write);
            
            socket.on(CHANNEL_RESIZE, function(size) {
                Term.resize(size.cols, size.rows);
            });
            
            Term.on('data', function(data) {
                socket.emit(CHANNEL, data);
            });
            
            Term.on('resize', function(size) {
                socket.emit(CHANNEL_RESIZE, size);
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
            var dir     = CloudCmd.LIBDIRCLIENT + 'terminal/',
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

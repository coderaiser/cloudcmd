var CloudCmd, Util, DOM, CloudFunc, Terminal;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Terminal = TerminalProto;
        
    function TerminalProto(CallBack) {
        var Name            = 'Terminal',
            Loading,
            Element,
            MouseBinded,
            Term,
            Cell,
            Key             = CloudCmd.Key,
            ESC             = Key.ESC,
            Images          = DOM.Images,
            Notify          = DOM.Notify,
            
            CHANNEL         = CloudFunc.CHANNEL_TERMINAL,
            CHANNEL_RESIZE  = CloudFunc.CHANNEL_TERMINAL_RESIZE,
            
            CloudTerm       = this;
            
        function init() {
            Loading = true;
            
            Util.loadOnLoad([
                DOM.jqueryLoad,
                CloudCmd.View,
                /* rm view keys, it ruin terminal */
                function(callback) {
                    CloudCmd.View.rmKeys(),
                    Util.exec(callback);
                },
                load,
                CloudCmd.Socket,
                CloudTerm.show,
                addListeners
            ]);
        }
        
        CloudTerm.show      = show;
        CloudTerm.write     = write;
        
        
        function show(callback) {
            var size,
                socket = CloudCmd.Socket;
            
            if (!Loading) {
                Images.showLoad({top:true});
                
                if (!Element) {
                    Element         = DOM.anyload({
                        name    : 'div',
                        id      : 'terminal',
                        style   : 'height :100%'
                    });
                    
                   /* hack to determine console size
                     * inspired with
                     * 
                     * https://github.com/petethepig/devtools-terminal
                     */
                    Cell            = DOM.anyload({
                        name    : 'div',
                        inner   : '&nbsp',
                        parent  : Element,
                        style   : 'position: absolute;' +
                                  'top      : -1000px;'
                    });
                    
                    DOM.cssSet({
                        id      : 'terminal-css',
                        inner   : '#terminal, .terminal, #view {'   +
                                    'height'            + ': 100%;' +
                                '}'                                 +
                                  '.terminal-cursor {'              +
                                    'background'        + ': gray'  +
                                '}'
                    });
                    
                    size    = getSize();
                    
                    Term    = new Terminal({
                        screenKeys: true,
                        cursorBlink: false,
                        cols: size.cols,
                        rows: size.rows
                    });
                    
                    Term.open(Element);
                }
                
                CloudCmd.View.show(Element, function() {
                    Element.focus();
                    Terminal.brokenBold = true;
                    
                    Util.exec(callback);
                }, {
                    onUpdate: function() {
                        var size = getSize();
                        Term.resize(size.cols, size.rows);
                        Term.emit('resize', size);
                    }
                });
            }
        }
        
        function write(data) {
            Term.write(data);
        }
        
        function addListeners(callback) {
            var socket  = CloudCmd.Socket;
            
            socket.on(CHANNEL, write);
            
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
        
        
        function load(pCallBack) {
            var dir     =  CloudCmd.LIBDIRCLIENT + 'terminal/',
                path    = dir + 'term.js';
            
            Util.time(Name + ' load');
            
            DOM.jsload(path, function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                
                Util.exec(pCallBack);
            });
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

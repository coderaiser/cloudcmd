var CloudCmd, Util, DOM, CloudFunc, Terminal;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';

    CloudCmd.Terminal = TerminalProto;
        
    function TerminalProto(CallBack) {
        var Name        = 'Terminal',
            Loading,
            Element,
            MouseBinded,
            Term,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            Notify      = DOM.Notify,
            CloudTerm   = this;
            
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
            var socket = CloudCmd.Socket;
            
            if (!Loading) {
                Images.showLoad({top:true});
                
                if (!Element) {
                    Element         = DOM.anyload({
                        name    : 'div',
                        id      : 'terminal',
                        style   : 'height :100%'
                    });
                    
                    DOM.cssSet({
                        id      : 'terminal-css',
                        inner   : '#terminal, .terminal, #view {'   +
                                    'height'            + ': 100%;' +
                                '}'
                    });
                    
                    
                    Term = new Terminal({
                        screenKeys: true,
                        cursorBlink: false,
                        cols: 80,
                        rows: 25
                    });
                    
                    Term.open(Element);
                }
                
                CloudCmd.View.show(Element, function() {
                    Element.focus();
                    Terminal.brokenBold = true;
                    
                    Util.exec(callback);
                });
            }
        }
        
        function write(data) {
            Term.write(data);
        }
        
        function listener(event) {
            var keyCode = event.keyCode,
                ESC     = Key.ESC;
            
            if (keyCode === ESC)
                CloudCmd.View.hide();
        }
        
        function addListeners(callback) {
            var socket  = CloudCmd.Socket,
                size    = {
                    cols: 80,
                    rows: 25
                };
            
            socket.on({
                'terminal-data'   : write
            });
            
            Term.on('keydown', listener);
            
            Term.on('data', function(data) {
                if (data)
                    socket.emit('terminal-data', data);
            });
            
            //Term.resize(size.cols, size.rows);
            socket.emit('terminal-resize', size);
            
            Util.exec(callback);
        }
        
        function maxSize() {
            var w       = Term.element.clientWidth - (Term.offsetWidth - Term.clientWidth),
                h       = Term.element.clientHeight - (Term.offsetHeight - Term.clientHeight),
                
                cols    = Math.max(Math.floor(w), 10),
                rows    = Math.max(Math.floor(h), 10),
                
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

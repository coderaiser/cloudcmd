var join, ace, Util, DOM;

(function(global, join, DOM, exec, load) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new Edward();
    else
        global.edward   = new Edward();
    
    function Edward() {
        var Element,
            ElementMsg,
            Value,
            Ace,
            
            edward      = function(el, callback) {
                Element = el || document.body;
                exec.series([
                    loadFiles,
                    function() {
                        Ace = ace.edit(Element);
                        callback();
                    },
                ]);
            };
        
        function createMsg() {
            var msg,
                wrapper = document.createElement('div'),
                html    = '<div class="edward-msg">/div>';
            
            wrapper.innerHTML = html;
            msg = wrapper.firstChild;
            
            return msg;
        }
        
        edward.addCommand       = function(options) {
            Ace.commands.addCommand(options);
        };
        
        edward.clearSelection   = function() {
            Ace.clearSelection();
            return edward;
        };
        
        edward.goToLine         = function() {
            var msg     = 'Enter line number:',
                cursor  = edward.getCursor(),
                number  = cursor.row + 1,
                line    = prompt(msg, number);
            
            number      = line - 0;
            
            if (number)
                Ace.gotoLine(number);
        };
        
        edward.moveCursorTo     = function(row, column) {
            Ace.moveCursorTo(row, column);
            return edward;
        };
        
        edward.focus            = function() {
            Ace.focus();
            return edward;
        };
        
        edward.remove           = function(direction) {
            Ace.remove(direction);
        };
        
        edward.getCursor        = function() {
            return Ace.selection.getCursor();
        };
        
        edward.getValue         = function() {
            return Ace.getValue();
        };
        
        edward.setValue         = function(value) {
            Ace.setValue(value);
        };
        
        edward.setValueFirst    = function(value) {
            var session     = edward.getSession(),
                UndoManager = ace.require('ace/undomanager').UndoManager;
            
            Value           = value;
            
            Ace.setValue(value);
            
            session.setUndoManager(new UndoManager());
        };
        
        edward.setOption    = function(name, value) {
            Ace.setOption(name, value);
        };
        
        edward.setOptions   = function(options) {
            Ace.setOptions(options);
        };
        
        edward.selectAll    = function() {
            Ace.selectAll();
        };
        
        edward.scrollToLine = function(row) {
            Ace.scrollToLine(row, true);
            return edward;
        };
        
        edward.getSession   = function() {
            return Ace.getSession();
        };
        
        edward.showMessage = function(text) {
            var HIDE_TIME   = 2000;
            
            /* 
             * Msg should be created and removed
             * if it's not and just inner text
             * is changing, when hide and show of DOM
             * is called - bug occures: empty box
             * with no text inside.
             */
            
            if (!ElementMsg) {
                ElementMsg = createMsg();
                Element.appendChild(ElementMsg);
            }
            
            ElementMsg.textContent = text;
            ElementMsg.hidden = false;
            
            setTimeout(function() {
                ElementMsg.hidden = true;
            }, HIDE_TIME);
        };
        
        function loadFiles(callback) {
            var css = '/css/edward.css',
                dir = '/modules/ace-builds/src-noconflict/',
                url = join([
                    'theme-tomorrow_night_blue',
                    'ext-language_tools',
                    'ext-searchbox',
                    'ext-modelist'
                ].map(function(name) {
                    return dir + name + '.js';
                }));
            
            DOM.loadRemote('ace', function() {
                load.parallel([url, css], callback);
            });
        }
        
        return edward;
    }
    
})(this, join, DOM, Util.exec, DOM.load);

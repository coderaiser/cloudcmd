var join, ace, Util, DOM;

(function(global, join, DOM, exec, load) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new edward();
    else
        global.edward   = new edward();
    
    function edward() {
        var Element,
            ElementMsg,
            Value,
            Ace,
            
            ed      = function(el, callback) {
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
        
        ed.addCommand       = function(options) {
            Ace.commands.addCommand(options);
        };
        
        ed.clearSelection   = function() {
            Ace.clearSelection();
            return ed;
        };
        
        ed.goToLine         = function() {
            var msg     = 'Enter line number:',
                cursor  = edward.getCursor(),
                number  = cursor.row + 1,
                line    = prompt(msg, number);
            
            number      = line - 0;
            
            if (number)
                Ace.gotoLine(number);
        };
        
        ed.moveCursorTo     = function(row, column) {
            Ace.moveCursorTo(row, column);
            return ed;
        };
        
        ed.focus            = function() {
            Ace.focus();
            return ed;
        };
        
        ed.remove           = function(direction) {
            Ace.remove(direction);
        };
        
        ed.getCursor        = function() {
            return Ace.selection.getCursor();
        };
        
        ed.getValue         = function() {
            return Ace.getValue();
        };
        
        ed.setValue         = function(value) {
            Ace.setValue(value);
        };
        
        ed.setValueFirst    = function(value) {
            var session     = ed.getSession(),
                UndoManager = ace.require('ace/undomanager').UndoManager;
            
            Value           = value;
            
            Ace.setValue(value);
            
            session.setUndoManager(new UndoManager());
        };
        
        ed.setOption    = function(name, value) {
            Ace.setOption(name, value);
        };
        
        ed.setOptions   = function(options) {
            Ace.setOptions(options);
        };
        
        ed.selectAll    = function() {
            Ace.selectAll();
        };
        
        ed.scrollToLine = function(row) {
            Ace.scrollToLine(row, true);
            return ed;
        };
        
        ed.getSession   = function() {
            return Ace.getSession();
        };
        
        ed.showMessage = function(text) {
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
        
        return ed;
    }
    
})(this, join, DOM, Util.exec, DOM.load);

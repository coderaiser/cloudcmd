var join, ace, Util, DOM, CloudCmd;

(function(global, join, DOM, exec, load, loadRemote, Files) {
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
            Modelist,
            JSHintConfig,
            Emmet,
            
            edward      = function(el, callback) {
                Element = el || document.body;
                
                Element.addEventListener('drop', onDrop);
                Element.addEventListener('dragover', function(event) {
                    event.preventDefault();
                });
                
                exec.series([
                    loadFiles,
                    function() {
                        Ace = ace.edit(Element);
                        ace.require('ace/ext/language_tools');
                        Modelist = ace.require('ace/ext/modelist');
                        
                        Files.get('edit', function(error, config) {
                            var options      = config.options;
                                
                            edward.setOptions(options);
                        });
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
            return edward;
        };
        
        edward.setValueFirst    = function(value) {
            var session     = edward.getSession(),
                UndoManager = ace.require('ace/undomanager').UndoManager;
            
            Value           = value;
            
            Ace.setValue(value);
            
            session.setUndoManager(new UndoManager());
        };
        
        edward.setOption        = function(name, value) {
            Ace.setOption(name, value);
        };
        
        edward.setOptions       = function(options) {
            Ace.setOptions(options);
        };
        
        edward.setUseOfWorker   = function(mode) {
            var isMatch,
                session = edward.getSession(),
                isStr   = typeof mode === 'string',
                regStr  = 'coffee|css|html|javascript|json|lua|php|xquery',
                regExp  = new RegExp(regStr);
            
            if (isStr)
                isMatch = regExp.test(mode);
            
            session.setUseWorker(isMatch);
        };
        
        edward.setMode                    = function(mode) {
            var ext,
                modesByName = Modelist.modesByName;
                
            if (modesByName[mode]) {
                ext = modesByName[mode].extensions.split('|')[0];
                edward.setModeForPath('.' + ext);
            }
        };
        
        edward.setModeForPath             = function(name) {
            var session     = edward.getSession(),
                modesByName = Modelist.modesByName,
                mode        = Modelist.getModeForPath(name).mode,
                
                htmlMode    = modesByName.html.mode,
                jsMode      = modesByName.javascript.mode,
                
                isHTML      = mode === htmlMode,
                isJS        = mode === jsMode;
                
            session.setMode(mode, function() {
                edward.setUseOfWorker(mode);
                
                if (isHTML)
                    setEmmet();
                
                if (isJS && session.getUseWorker())
                    setJsHintConfig();
            });
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
        
        edward.sha          = function(callback) {
            var dir             = '/modules/jsSHA/',
                url             = dir + 'src/sha1.js';
            
            load.js(url, function() {
                var shaObj, hash, error,
                    value   = edward.getValue();
                
                error = exec.try(function() {
                    shaObj  = new window.jsSHA(value, 'TEXT');
                    hash    = shaObj.getHash('SHA-1', 'HEX');
                });
                
                callback(error, hash);
            });
        };
        
        function setEmmet() {
            Files.get('edit', function(error, config) {
                var dir         = '/modules/ace-builds/src-noconflict/',
                    extensions  = config.extensions,
                    isEmmet     = extensions.emmet;
                
                if (isEmmet)
                    exec.if(Emmet, function() {
                        edward.setOption('enableEmmet', true);
                    }, function(callback) {
                        var url;
                        
                        url = join([
                            dir + 'emmet.js',
                            dir + 'ext-emmet.js'
                        ]);
                        
                        load.js(url, function() {
                            Emmet = ace.require('ace/ext/emmet');
                            Emmet.setCore(window.emmet);
                            
                            callback();
                        });
                    });
                });
        }
        
        function setJsHintConfig(callback) {
            var JSHINT_PATH = CloudCmd.PREFIX + '/.jshintrc',
                func        = function() {
                    var session = edward.getSession(),
                        worker  = session.$worker;
                    
                    if (worker)
                        worker.send('changeOptions', [JSHintConfig]);
                    
                    exec(callback);
                };
            
            exec.if(JSHintConfig, func, function() {
                DOM.load.ajax({
                    url     :  JSHINT_PATH,
                    success : function(data) {
                        exec.try(function() {
                            JSHintConfig = JSON.parse(data);
                        });
                        
                        func();
                    }
                });
            });
        }
        
        function onDrop(event) {
            var reader, files,
                onLoad   =  function(event) {
                    var data    = event.target.result;
                    
                    edward.setValue(data);
                };
            
            event.preventDefault();
            
            files   = event.dataTransfer.files;
            
            [].forEach.call(files, function(file) {
                reader  = new FileReader();
                reader.addEventListener('load', onLoad);
                reader.readAsBinaryString(file);
            });
        }
        
        function loadFiles(callback) {
            var css = '/css/edward.css',
                js  = '/restafary.js',
                dir = '/modules/ace-builds/src-noconflict/',
                url = join([
                    'theme-tomorrow_night_blue',
                    'ext-language_tools',
                    'ext-searchbox',
                    'ext-modelist'
                ].map(function(name) {
                    return dir + name + '.js';
                }));
            
            loadRemote('ace', function() {
                load.parallel([url, js, css], callback);
            });
        }
        
        return edward;
    }
    
})(this, join, DOM, Util.exec, DOM.load, DOM.loadRemote, DOM.Files);

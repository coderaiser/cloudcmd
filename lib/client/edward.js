var join, ace, load, Util, DOM, Diff, io, Format, restafary;

(function(global, join, DOM, exec, loadRemote) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new Edward();
    else
        global.edward   = new Edward();
    
    function Edward() {
        var Ace,
            Emmet,
            Value,
            Config,
            PREFIX,
            Element,
            FileName,
            Modelist,
            ElementMsg,
            JSHintConfig,
            
            DIR             = '/modules/',
            Files           = DOM.Files,
            Storage         = DOM.Storage,
            MAX_FILE_SIZE   = 512000,
            
            edward      = function(el, options, callback) {
                if (!options) {
                    callback = options;
                } else {
                    MAX_FILE_SIZE   = options.maxSize || 512000;
                    PREFIX          = options.prefix || '/';
                }
                
                Element = el || document.body;
                
                Element.addEventListener('drop', onDrop);
                Element.addEventListener('dragover', function(event) {
                    event.preventDefault();
                });
                
                exec.series([
                    loadFiles,
                    function(callback) {
                        loadRemote('socket', {
                            name : 'io',
                            noPrefix: true
                        }, initSocket);
                        
                        callback();
                    },
                    function() {
                        Ace = ace.edit(Element);
                        ace.require('ace/ext/language_tools');
                        Modelist = ace.require('ace/ext/modelist');
                        
                        load.json('/json/edit.json', function(error, config) {
                            var options = config.options;
                            
                            Config     = config;
                            edward.setOptions(options);
                            callback();
                        });
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
        
        edward.isChanged        = function() {
            var is,
                value   = edward.getValue(),
                isEqual = value === Value,
                msg     = 'Do you want to save changes to ' + name + '?';
            
            if (!isEqual) {
                is = confirm(msg);
                
                if (is)
                    edward.save();
            }
        };
        
        edward.setValue         = function(value) {
            Ace.setValue(value);
            return edward;
        };
        
        edward.setValueFirst    = function(name, value) {
            var session     = edward.getSession(),
                UndoManager = ace.require('ace/undomanager').UndoManager;
            
            FileName        = name;
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
            var dir             = DIR + 'jsSHA/',
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
        
        edward.beautify = function() {
           readWithFlag('beautify');
        };
        
        edward.minify = function() {
            readWithFlag('minify');
        };
        
        edward.save = function() {
            var value   = edward.getValue();
            
            Files.get('config', function(error, config) {
                var isDiff      = config.diff,
                    isZip       = config.zip;
                
                exec.if(!isDiff, function(patch) {
                    var query           = '',
                        patchLength     = patch && patch.length || 0,
                        length          = Value.length,
                        isLessMaxLength = length < MAX_FILE_SIZE,
                        isLessLength    = isLessMaxLength && patchLength < length,
                        isStr           = typeof patch === 'string',
                        isPatch         = patch && isStr && isLessLength;
                    
                    Value               = value;
                    
                    exec.if(!isZip || isPatch, function(equal, data) {
                        var result  = data || Value;
                        
                        if (isPatch)
                            edward.save.patch(FileName, patch);
                        else
                            edward.save.write(FileName + query, result);
                    }, function(func) {
                        zip(value, function(error, data) {
                            if (error)
                                console.error(error);
                            
                            query = '?unzip';
                            func(null, data);
                        });
                    });
                    
                }, exec.with(doDiff, FileName));
            });
        };
        
        edward.save.patch = patchHttp;
        edward.save.write = writeHttp;
        
        function patchHttp(path, patch) {
            restafary.patch(path, patch, onSave);
        }
        
        function writeHttp(path, result) {
            restafary.write(path, result, onSave);
        }
        function onSave(error, text) {
            var ret,
                size    = Format.size(Value.length),
                msg     = '\nShould I save file anyway?';
                
            if (error) {
                ret     = confirm(error.message + msg);
                
                if (ret)
                    restafary.write(FileName, Value);
            } else {
                edward.showMessage(text);
                
                edward.sha(function(error, hash) {
                    if (error)
                        console.error(error);
                    
                    DOM.saveDataToStorage(FileName, Value, hash);
                });
                
                DOM.setCurrentSize(size);
            }
        }
        
        function doDiff(path, callback) {
            var value = edward.getValue();
            
            diff(value, function(patch) {
                var isAllowed = Storage.isAllowed();
                
                exec.if(!isAllowed, callback, function(func) {
                    DOM.checkStorageHash(path, function(error, equal) {
                        if (!equal)
                            patch = '';
                        
                        func(patch);
                    });
                });
            });
        }
        
        function diff(newValue, callback) {
            loadDiff(function(error) {
                var patch, 
                    isAllowed   = Storage.isAllowed();
                
                if (error) {
                    alert(error);
                } else {
                    exec.if(!isAllowed, function() {
                        patch       = Diff.createPatch(Value, newValue);
                        exec(callback, patch);
                    }, function(func) {
                        DOM.getDataFromStorage(FileName, function(error, data) {
                            if (data)
                                Value   = data;
                            
                            func();
                        });
                    });
                }
            });
        }
        
        function loadDiff(callback) {
             var url = join([
                    'google-diff-match-patch/diff_match_patch.js',
                    'daffy/lib/daffy.js'
                ].map(function(name) {
                    return DIR + name;
                }));
            
            DOM.load.js(url, function(error) {
                if (!error && !Diff)
                    Diff = window.daffy;
                
                callback(error);
            });
        }
        
        function zip(value, callback) {
            exec.parallel([
                function(callback) {
                    var url = DIR + 'zipio/lib/zipio.js';
                    DOM.load.js(url, callback);
                },
                function(callback) {
                    loadRemote('pako', callback);
                }
            ], function(error) {
                if (error)
                    alert(error);
                else
                    global.zipio(value, callback);
            });
        }
        
        function setEmmet() {
            var dir         = DIR + 'ace-builds/src-noconflict/',
                extensions  = Config.extensions,
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
        }
        
        function setJsHintConfig(callback) {
            var JSHINT_PATH = PREFIX + '/.jshintrc',
                func        = function() {
                    var session = edward.getSession(),
                        worker  = session.$worker;
                    
                    if (worker)
                        worker.send('changeOptions', [JSHintConfig]);
                    
                    exec(callback);
                };
            
            exec.if(JSHintConfig, func, function() {
                load.json(JSHINT_PATH, function(error, json) {
                        if (error)
                            alert(error);
                        else
                            JSHintConfig = json;
                        
                        func();
                });
            });
        }
        
         function getHost() {
            var l       = location,
                href    = l.origin || l.protocol + '//' + l.host;
            
            return href;
        }
        
        function initSocket(error) {
            var socket,
                href            = getHost(),
                FIVE_SECONDS    = 5000,
                patch    = function(name, data) {
                    socket.emit('patch', name, data);
                };
                
            if (!error) {
                socket  = io.connect(href + '/edit', {
                    'max reconnection attempts' : Math.pow(2, 32),
                    'reconnection limit'        : FIVE_SECONDS
                });
                
                socket.on('connect', function() {
                    edward.save.patch = patch;
                });
                
                socket.on('message', function(msg) {
                    onSave(null, msg);
                });
                
                socket.on('patch', function(name, data, hash) {
                    if (name === FileName)
                        loadDiff(function(error) {
                            if (error)
                                console.error(error);
                            else
                                DOM.Storage.get(name + '-hash', function(error, hashLocal) {
                                    var cursor, value;
                                    
                                    if (hash === hashLocal) {
                                        cursor  = edward.getCursor(),
                                        value   = edward.getValue();
                                        value   = Diff.applyPatch(value, data);
                                        
                                        edward.setValue(value);
                                        
                                        edward.sha(function(error, hash) {
                                            DOM.saveDataToStorage(name, value, hash);
                                            edward
                                                .clearSelection()
                                                .moveCursorTo(cursor.row, cursor.column)
                                                .scrollToLine(cursor.row, true);
                                        });
                                    }
                                });
                        });
                });
                
                socket.on('disconnect', function() {
                    edward.save.patch = patchHttp;
                });
                
                socket.on('err', function(error) {
                    alert(error);
                });
            }
        }
        
        function readWithFlag(flag) {
            var path = FileName;
            
            restafary.read(path + '?' + flag, function(error, data) {
                if (error)
                    alert(error);
                else
                    edward
                        .setValue(data)
                        .clearSelection()
                        .moveCursorTo(0, 0);
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
            var css     = '/css/edward.css',
                js      = '/restafary.js',
                
                ace     = DIR + 'ace-builds/src-noconflict/',
                
                url     = join([
                    ace + 'theme-tomorrow_night_blue',
                    ace + 'ext-language_tools',
                    ace + 'ext-searchbox',
                    ace + 'ext-modelist'
                ].map(function(name) {
                    return name + '.js';
                }));
            
            exec.series([
                function(callback) {
                    loadScript(DIR + 'load/load.js', callback);
                },
                
                function(callback) {
                    loadRemote('ace', callback);
                },
                
                function(callback) {
                    load.parallel([url, js, css], callback);
                },
                
                callback
            ]);
        }
        
        function loadScript(src, callback) {
            var element = document.createElement('script');
            
            element.src = src;
            element.addEventListener('load', callback);
            
            document.body.appendChild(element);
        }
        
        return edward;
    }
    
})(this, join, DOM, Util.exec, DOM.loadRemote);

var CloudCmd, Util, DOM, CloudFunc, io, ace, Zip, Format, MenuIO, edward;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Edit = EditProto;
        
    function EditProto(callback) {
        var Name        = 'Edit',
            Loading     = true,
            DIR         = '/modules/ace-builds/src-noconflict/',
            Info        = DOM.CurrentInfo,
            Files       = DOM.Files,
            Storage     = DOM.Storage,
            exec        = Util.exec,
            join        = CloudCmd.join,
            FileName,
            Value,
            Edit        = this,
            Diff,
            Emmet,
            Modelist,
            
            Menu,
            
            RESTful     = DOM.RESTful,
            Dialog      = DOM.Dialog,
            Images      = DOM.Images,
            Element, JSHintConfig,
            ConfigView  = {
                beforeClose: function() {
                    isChanged();
                    exec.ifExist(Menu, 'hide');
                },
                afterShow: function() {
                    edward
                        .clearSelection()
                        .moveCursorTo(0, 0)
                        .focus();
                }
            };
        
       function init(callback) {
            var element = createElement();
            
            element.addEventListener('contextmenu', setMenu);
            
            exec.series([
                CloudCmd.View,
                function(callback) {
                    loadFiles(element, callback);
                },
                function(callback) {
                    DOM.loadSocket(initSocket);
                    callback();
                },
                function(callback) {
                    Edit.create(element)
                        .show(callback);
                    
                }, callback]);
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
                    Edit.save.patch = patch;
                });
                
                socket.on('message', function(msg) {
                    onSave(msg);
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
                                        
                                        sha(function(error, hash) {
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
                    Edit.save.patch = patchHttp;
                });
                
                socket.on('err', function(error) {
                    Dialog.alert(error);
                });
            }
        }
        
        function createElement() {
            var element = DOM.load({
                name        : 'div',
                style   :
                    'width      : 100%;'    +
                    'height     : 100%;'    +
                    'font       : 16px "Droid Sans Mono";' +
                    'position   : absolute;',
                notAppend : true
            });
            
            return element;
        }
        
        this.show                       = function(callback) {
            var isDir   = Info.isDir,
                name    = Info.name;
            
            FileName    = Info.path;
            
            Images.show.load();
            
            if (callback)
                ConfigView.beforeShow = callback;
            
            if (isDir)
                Edit.setMode('json');
            else
                Edit.setModeForPath(name);
            
            Info.getData(function(error, data) {
                if (error) {
                    alert(error);
                } else {
                    Edit.setValueFirst(data);
                    CloudCmd.View.show(Element, ConfigView);
                }
            });
            
            return this;
        };
        
        this.setValueFirst              = function(value) {
            Value = value;
            edward.setValueFirst(value);
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        this.goToLine                   = function() {
            edward.goToLine();
        };
        
        this.setModeForPath             = function(name) {
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
        
        this.setMode                    = function(mode) {
            var ext,
                modesByName = Modelist.modesByName;
                
            if (modesByName[mode]) {
                ext = modesByName[mode].extensions.split('|')[0];
                Edit.setModeForPath('.' + ext);
            }
        };
        
        function isChanged() {
            var is,
                value   = edward.getValue(),
                isEqual = value === Value,
                msg     = 'Do you want to save changes to ' + name + '?';
            
            if (!isEqual) {
                is = Dialog.confirm(msg);
                
                if (is)
                    Edit.save();
            }
        }
        
        function setEmmet() {
            Files.get('edit', function(error, config) {
                var extensions  = config.extensions,
                    isEmmet     = extensions.emmet;
                
                if (isEmmet)
                    exec.if(Emmet, function() {
                        edward.setOption('enableEmmet', true);
                    }, function(callback) {
                        var url;
                        
                        url = join([
                            DIR + 'emmet.js',
                            DIR + 'ext-emmet.js'
                        ]);
                        
                        DOM.load.js(url, function() {
                            Emmet = ace.require('ace/ext/emmet');
                            Emmet.setCore(window.emmet);
                            
                            callback();
                        });
                    });
                });
        }
        
        this.create = function(element) {
            Element     = element;
            
            edward.addCommand({
                name    : 'hide',
                bindKey : { win: 'Esc',  mac: 'Esc' },
                exec    : function () {
                    Edit.hide();
                }
            });
            
            edward.addCommand({
                name    : 'goToLine',
                bindKey : { win: 'Ctrl-G',  mac: 'Command-G' },
                exec    : function () {
                    Edit.goToLine();
                }
            });
            
            edward.addCommand({
                name    : 'save',
                bindKey : { win: 'Ctrl-S',  mac: 'Command-S' },
                exec    : function() {
                    Edit.save();
                }
            });
            
            edward.addCommand({
                name    : 'saveMC',
                bindKey : { win: 'F2',  mac: 'F2' },
                exec    : function() {
                    Edit.save();
                }
            });
            
            edward.addCommand({
                name    : 'beautify',
                bindKey : { win: 'Ctrl-B',  mac: 'Command-B' },
                exec    : function() {
                    Edit.beautify();
                }
            });
            
            edward.addCommand({
                name    : 'minify',
                bindKey : { win: 'Ctrl-M',  mac: 'Command-M' },
                exec    : function() {
                    Edit.minify();
                }
            });
            
            ace.require('ace/ext/language_tools');
            Modelist = ace.require('ace/ext/modelist');
            
            Files.get('edit', function(error, config) {
                var options      = config.options;
                    
                edward.setOptions(options);
            });
            
            return this;
        };
        
        Edit.save = function() {
            var value   = edward.getValue();
            
            Files.get('config', function(error, config) {
                var isDiff      = config.diff,
                    isZip       = config.zip;
                
                exec.if(!isDiff, function(patch) {
                    var query           = '',
                        MAX_SIZE        = CloudFunc.MAX_FILE_SIZE,
                        patchLength     = patch && patch.length || 0,
                        length          = Value.length,
                        isLessMaxLength = length < MAX_SIZE,
                        isLessLength    = isLessMaxLength && patchLength < length,
                        isStr           = typeof patch === 'string',
                        isPatch         = patch && isStr && isLessLength;
                    
                    Value               = value;
                    
                    exec.if(!isZip || isPatch, function(equal, data) {
                        var result  = data || Value;
                        
                        if (isPatch)
                            Edit.save.patch(FileName, patch);
                        else
                            Edit.save.write(FileName + query, result);
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
        
        Edit.save.patch = patchHttp;
        Edit.save.write = writeHttp;
        
        function patchHttp(path, patch) {
            RESTful.patch(path, patch, onSave);
        }
        
        function writeHttp(path, result) {
            RESTful.write(path, result, onSave);
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
                    Dialog.alert(error);
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
                    '/modules/google-diff-match-patch/diff_match_patch.js',
                    '/modules/daffy/lib/daffy.js'
                ]);
            
            DOM.load.js(url, function(error) {
                if (!error && !Diff)
                    Diff = window.daffy;
                
                callback(error);
            });
        }
        
        function zip(value, callback) {
            var dir             = CloudCmd.LIBDIRCLIENT,
                url             = dir + 'zip.js';
            
            exec.parallel([
                function(callback) {
                    DOM.load.js(url, callback);
                },
                function(callback) {
                    DOM.loadRemote('pako', callback);
                }
            ], function(error) {
                if (error)
                    alert(error);
                else
                    Zip.pack(value, callback);
            });
        }
        
        function sha(callback) {
            var dir             = '/modules/jsSHA/',
                url             = dir + 'src/sha1.js';
            
            DOM.load.js(url, function() {
                var shaObj, hash, error,
                    value   = edward.getValue();
                
                error = exec.try(function() {
                    shaObj  = new window.jsSHA(value, 'TEXT');
                    hash    = shaObj.getHash('SHA-1', 'HEX');
                });
                
                callback(error, hash);
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
        
        function loadFiles(element, callback) {
            var dir     = CloudCmd.LIBDIRCLIENT,
                name    = 'edward',
                url     = dir + name + '.js';
            
            Util.time(Name + ' load');
            
            DOM.load.js(url, function() {
                Loading = false;
                
                edward(element, function() {
                    Util.timeEnd(Name + ' load');
                    exec(callback);
                });
            });
        }
        
        function onSave(text) {
            var ret,
                size    = Format.size(Value.length),
                isError = /^error/.test(text),
                msg     = '\nShould I save file anyway?';
                
            if (!isError) {
                Edit.showMessage(text);
                
                sha(function(error, hash) {
                    if (error)
                        console.error(error);
                    
                    DOM.saveDataToStorage(FileName, Value, hash);
                });
                
                DOM.setCurrentSize(size);
            } else {
                ret     = Dialog.confirm(text + msg);
                
                if (ret)
                    RESTful.write(FileName, Value, onSave);
            }
        }
        
        function setMenu() {
            if (!Menu) {
                DOM.loadRemote('menu', function(error) {
                    var position    = CloudCmd.MousePosition,
                        options     = {
                            beforeShow: function(params) {
                                params.x -= 18;
                                params.y -= 27;
                            },
                            afterClick: function() {
                                edward.focus();
                            }
                    },
                    menuData    = {
                        'Save           Ctrl+S' : function() {
                            CloudCmd.Edit.save();
                        },
                        'Go To Line     Ctrl+G' : function() {
                            CloudCmd.Edit.goToLine();
                        },
                        'Select All     Ctrl+A' : function() {
                            edward.selectAll();
                        },
                        'Delete         Del'    : function() {
                            edward.remove('right');
                        },
                        'Beautify       Ctrl+B' : function() {
                            CloudCmd.Edit.beautify();
                        },
                        'Minify         Ctrl+M' : function() {
                            CloudCmd.Edit.minify();
                        },
                        'Close          Esc'    : CloudCmd.Edit.hide
                    };
                    
                    if (error) {
                        alert(error);
                    } else if (!Menu) {
                        Menu = new MenuIO(Element, options, menuData);
                        Menu.show(position.x, position.y);
                        
                        Element.removeEventListener('contextmenu', setMenu);
                    }
                });
            }
        }
        
        Edit.beautify = function() {
           readWithFlag('beautify');
        };
        
        Edit.minify = function() {
            readWithFlag('minify');
        };
        
        function readWithFlag(flag) {
            var path = FileName;
            
            Util.check(arguments, ['flag']);
            
            RESTful.read(path + '?' + flag, function(data) {
                edward
                    .setValue(data)
                    .clearSelection()
                    .moveCursorTo(0, 0);
            });
        }
        
        this.showMessage    = function(text) {
            edward.showMessage(text);
        };
        
        init(callback);
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

var CloudCmd, Util, DOM, CloudFunc, ace, DiffProto, diff_match_patch, Zip, MenuIO;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Edit = EditProto;
        
    function EditProto() {
        var Name        = 'Edit',
            Loading     = false,
            DIR         = CloudCmd.LIBDIRCLIENT + 'edit/',
            LIBDIR      = CloudCmd.LIBDIR,
            Info        = DOM.CurrentInfo,
            Menu,
            Value,
            Edit        = this,
            Diff,
            Emmet,
            Ace,
            Session,
            Modelist,
            Msg,
            Events      = DOM.Events,
            Dialog      = DOM.Dialog,
            Images      = DOM.Images,
            Element, JSHintConfig, EditConfig;
            
       function init() {
            Loading   = true;
            Util.loadOnLoad([
                CloudCmd.View,
                load,
                Edit.show
            ]);
        }
        
        this.show                       = function(value) {
            var mode, htmlMode, jsMode, isHTML, isJS, modesByName,
                isStr       = Util.isString(value),
                name        = Info.name,
                isDir       = Info.isDir,
                focus       = function() {
                    Ace.focus();
                    Ace.clearSelection();
                    Ace.moveCursorTo(0, 0);
                };
            
            if (!Loading) {
                Images.showLoad();
                
                if (!Element) {
                    Element         = DOM.anyload({
                        name        : 'div',
                        style   :
                            'width      : 100%;'    +
                            'height     : 100%;'    +
                            'font       : 16px "Droid Sans Mono";' +
                            'position   : absolute;',
                        not_append : true
                    });
                  
                  initAce();
                  
                  Events.add({
                      drop          : onDrop,
                      dragover      : function(event) {
                          event.preventDefault();
                      },
                  }, Element);
                }
                
                setMenu(Element);
                
                modesByName = Modelist.modesByName;
                
                if (isDir)
                    mode    = modesByName.json.mode;
                else
                    mode    = Modelist.getModeForPath(name).mode;
                
                htmlMode    = modesByName.html.mode;
                jsMode      = modesByName.javascript.mode;
                
                isHTML      = mode === htmlMode;
                isJS        = mode === jsMode;
                
                Session.setMode(mode);
                setUseOfWorker(mode);
                
                setEmmet(isHTML);
                
                Util.ifExec(isStr, function() {
                    var UndoManager = ace.require('ace/undomanager').UndoManager;
                    
                    Ace.setValue(Value);
                    CloudCmd.View.show(Element, {
                        beforeClose: isChanged,
                        afterShow: focus
                    });
                    
                    Session.setUndoManager(new UndoManager());
                }, function(callback) {
                    Info.getData(function(data) {
                        Value = data;
                        
                        if (isJS && Session.getUseWorker())
                            setJsHintConfig();
                        
                        callback();
                    });
                });
            }
        };
        
        this.hide                       =  function() {
            CloudCmd.View.hide();
        };
        
        this.goToLine                   = function() {
            var msg     = 'Enter line number:',
                cursor  = Ace.selection.getCursor(),
                number  = cursor.row + 1,
                line    = Dialog.prompt(msg, number);
            
            number      = line - 0;
            
            if (number)
                Ace.gotoLine(number);
        };
        
        function isChanged() {
            var is,
                value   = Ace.getValue(),
                isEqual = value === Value,
                msg     = 'Do you want to save changes to ' + name + '?';
            
            if (!isEqual) {
                is = Dialog.confirm(msg);
                
                if (is)
                    save();
            }
        }
        
        function setEmmet(isHTML) {
            getEditConfig(function(config) {
                var extensions  = config.extensions,
                    isEmmet     = extensions.emmet;
                
                if (isEmmet)
                    Util.ifExec(Emmet, function() {
                            if (Emmet)
                                Ace.setOption('enableEmmet', isHTML);
                        }, function(callback) {
                            var url;
                            
                            if (!isHTML) 
                                Util.exec(callback);
                            else {
                                url = CloudFunc.getJoinURL([
                                    DIR + 'emmet.js',
                                    DIR + 'ext-emmet.js'
                                ]);
                                
                                DOM.jsload(url, function() {
                                    Emmet = ace.require('ace/ext/emmet');
                                    Emmet.setCore(window.emmet);
                                    Util.exec(callback);
                                });
                            }
                        });
                });
        }
        
        function setUseOfWorker(mode) {
            var isMatch,
                isStr   = Util.isString(mode),
                regStr  = 'coffee|css|html|javascript|json|lua|php|xquery',
                regExp  = new RegExp(regStr);
            
            if (isStr)
                isMatch = mode.match(regExp);
            
            Session.setUseWorker(isMatch);
        }
        
        function initAce() {
            Ace     = ace.edit(Element);
            Session = Ace.getSession();
            
            Ace.commands.addCommand({
                name    : 'hide',
                bindKey : { win: 'Esc',  mac: 'Esc' },
                exec    : function () {
                    Edit.hide();
                }
            });
            
            Ace.commands.addCommand({
                name    : 'goToLine',
                bindKey : { win: 'Ctrl-G',  mac: 'Command-G' },
                exec    : function () {
                    Edit.goToLine();
                }
            });
            
            Ace.commands.addCommand({
                name    : 'save',
                bindKey : { win: 'Ctrl-S',  mac: 'Command-S' },
                exec    : save
            });
            
            Ace.commands.addCommand({
                name    : 'saveMC',
                bindKey : { win: 'F2',  mac: 'F2' },
                exec    : save
            });
            
            ace.require('ace/ext/language_tools');
            Modelist = ace.require('ace/ext/modelist');
            
            getEditConfig(function(config) {
                var options      = config.options;
                    
                Ace.setOptions(options);
            });
        }
        
        function save () {
            var path    = Info.path,
                value   = Ace.getValue();
            
            CloudCmd.getConfig(function(config) {
                var isDiff      = config.diff,
                    isZip       = config.zip;
                
                Util.ifExec(!isDiff, function(patch) {
                    var query           = '',
                        MAX_SIZE        = CloudFunc.MAX_FILE_SIZE,
                        patchLength     = patch.length,
                        length          = Value.length,
                        isLessMaxLength = length < MAX_SIZE,
                        isLessLength    = isLessMaxLength && patchLength < length,
                        isStr           = Util.isString(patch);
                    
                    Value               = value;
                    
                    if (isStr && patch && isLessLength)
                        query           = '?patch';
                    else
                        patch           = false;
                    
                    Util.ifExec(!isZip || query, function(equal, data) {
                        var result  = data || patch || Value,
                            url     = path + query;
                        
                        DOM.RESTful.write(url, result , onSave);
                    }, function(func) {
                        zip(value, function(error, data) {
                            if (error)
                                Util.log(error);
                            
                            query = '?unzip';
                            func(null, data);
                        });
                    });
                    
                }, Util.bind(doDiff, path));
            });
        }
        
        function doDiff(path, callback) {
            var value = Ace.getValue();
            
            diff(value, function(patch) {
                var isAllowed = DOM.Storage.isAllowed();
                
                Util.ifExec(!isAllowed, callback, function(func) {
                        DOM.checkStorageHash(path, function(error, equal) {
                            if (!equal)
                                patch = '';
                            
                            func(patch);
                        });
                });
            });
        }
        
        function diff(newValue, callback) {
            var libs            = [
                    LIBDIR + 'diff/diff-match-patch.js',
                    LIBDIR + 'diff.js'
                ],
                url             = CloudFunc.getJoinURL(libs);
            
            DOM.jsload(url, function() {
                var patch, 
                    isAllowed   = DOM.Storage.isAllowed();
                
                if (!Diff)
                    Diff        = new DiffProto(diff_match_patch);
                
                Util.ifExec(!isAllowed, function() {
                    patch       = Diff.createPatch(Value, newValue);
                    Util.exec(callback, patch);
                }, function(func) {
                    var path = Info.path;
                    
                    DOM.getDataFromStorage(path, function(data) {
                        if (data)
                            Value   = data;
                        
                        func();
                    });
                });
            });
        }
        
        function zip(value, callback) {
            var dir             = CloudCmd.LIBDIRCLIENT,
                libs            = [
                    dir + 'zip/dist/pako.js',
                    dir + 'zip.js'
                ],
                url             = CloudFunc.getJoinURL(libs);
            
            DOM.jsload(url, function() {
                Zip.pack(value, callback);
            });
        }
        
        function setJsHintConfig(callback) {
            var JSHINT_PATH = '/.jshintrc',
                func        = function() {
                    var worker  = Session.$worker;
                    
                    if (worker)
                        worker.send('changeOptions', [JSHintConfig]);
                    
                    Util.exec(callback);
                };
            
            Util.ifExec(JSHintConfig, func, function() {
                DOM.ajax({
                    url     :  JSHINT_PATH,
                    success : function(data) {
                        JSHintConfig = Util.parseJSON(data);
                        func();
                    }
                });
            });
        }
        
        function getEditConfig(callback) {
            var CONFIG_PATH = '/json/edit.json',
                func        = Util.retExec(callback);
            
            Util.ifExec(EditConfig, function() {
                func(EditConfig);
            }, function() {
                DOM.ajax({
                    url     : CONFIG_PATH,
                    success : function(data) {
                        EditConfig = data;
                        func(EditConfig);
                    }
                });
            });
        }
        
        function setMenu(element) {
            DOM.menuLoad(function() {
                var options = {
                    beforeShow: function(params) {
                        params.x -= 18;
                        params.y -= 27;
                    }
                };
                
                Menu        = new MenuIO(element, options, {
                    'Save           Ctrl+S': save,
                    'Go To Line     Ctrl+G': Edit.goToLine
                });
            });
        }
        
        function load(callback) {
            var files  = [
                    DIR + 'theme-tomorrow_night_blue.js',
                    DIR + 'ext-language_tools.js',
                    DIR + 'ext-searchbox.js',
                    DIR + 'ext-modelist.js'
                ],
                
                ace     = DIR + 'ace.js',
                url     = CloudFunc.getJoinURL(files);
            
            Util.time(Name + ' load');
            
            DOM.anyLoadOnLoad([ace, url], function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                Util.exec(callback);
            });
        }
        
        function onSave(text) {
            var ret,
                isError = Util.isContainStrAtBegin(text, 'error'),
                path    = Info.path,
                msg     = '\nShould I save file anyway?';
                
            if (!isError) {
                Edit.showMessage(text);
                DOM.saveDataToStorage(path, Value);
                DOM.setCurrentSize(Value.length);
            } else {
                ret     = Dialog.confirm(text + msg);
                
                if (ret)
                    DOM.RESTful.write(path, Value, onSave);
            }
        }
        
         function onDrop(event) {
            var reader, i, n, file, files,
                onLoad   =  function(event) {
                    var data    = event.target.result;
                    
                    Ace.setValue(data);
                };
            
            event.preventDefault();
            
            files   = event.dataTransfer.files;
            
            if (files)
                files.forEach(function(file) {
                    reader  = new FileReader();
                    DOM.Events.add('load', onLoad, reader);
                    reader.readAsBinaryString(file);
                });
        }
        
        this.showMessage    = function(text) {
            var parent, 
                HIDE_TIME = 2000;
            
            if (!Msg) {
                DOM.cssSet({
                    id      : 'msg-css',
                    inner   : '#js-view .msg {'     +
                                'z-index'           + ': 1;'                    +
                                'background-color'  + ': #7285B7;'              +
                                'color'             + ': #D1F1A9;'              +
                                'position'          + ': fixed;'                +
                                'left'              + ': 40%;'                  +
                                'top'               + ': 25px;'                 +
                                'padding'           + ': 5px;'                  +
                                'opacity'           + ': 0.9;'                  +
                                'transition'        + ': ease 0.5s;'            +
                            '}'
                });
                parent  = Element;
                
                Msg     = DOM.anyload({
                    name        : 'div',
                    className   : 'msg',
                    parent      : parent
                });
            }
            
            Msg.innerHTML = text;
            DOM.show(Msg);
            setTimeout(Util.retExec(DOM.hide, Msg), HIDE_TIME);
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

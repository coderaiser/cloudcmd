var CloudCmd, Util, DOM, CloudFunc, ace, DiffProto, diff_match_patch;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Edit = EditProto;
        
    function EditProto(CallBack) {
        var Name        = 'Edit',
            Loading     = false,
            DIR         = CloudCmd.LIBDIRCLIENT + 'edit/',
            LIBDIR      = CloudCmd.LIBDIR,
            Info        = DOM.CurrentInfo,
            Value,
            Edit        = this,
            Diff,
            Emmet,
            Ace,
            Session,
            Modelist,
            Msg,
            Dialog      = DOM.Dialog,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            Element;
            
       function init() {
            Loading   = true;
            Util.loadOnLoad([
                CloudCmd.View,
                load,
                Edit.show
            ]);
        }
        
        this.show                       = function(pValue) {
            var lMode, htmlMode, cssMode, url,
                lName       = Info.name,
                isDir       = Info.isDir,
                lExt        = Info.ext;
            
            if (!Loading) {
                Images.showLoad();
                
                if (!Element) {
                    Element         = DOM.anyload({
                        name        : 'div',
                        style   :
                            'width      : 100%;'    +
                            'height     : 100%;'    +
                            'font       : 16px "Droid Sans Mono";' +
                            'position: absolute;',
                        not_append : true
                    });
                  
                  initAce();
                }
                
                if (isDir)
                    lMode = Modelist.modesByName.json.mode;
                else
                    lMode = Modelist.getModeForPath(lName).mode;
                
                htmlMode  = Modelist.modesByName.html.mode;
                cssMode   = Modelist.modesByName.css.mode;
                
                Session.setMode(lMode);
                
                if (lMode === htmlMode) {
                    if (Emmet)
                        Ace.setOption('enableEmmet', true);
                    else {
                        url = CloudFunc.getJoinURL([
                            DIR + 'emmet.js',
                            DIR + 'ext-emmet.js'
                        ]);
                        
                        DOM.jsload(url, function() {
                            Emmet = ace.require('ace/ext/emmet');
                            Emmet.setCore(window.emmet);
                            Ace.setOption('enableEmmet', true);
                        });
                    }
                } else if (Emmet) {
                    Ace.setOption('enableEmmet', false);
                }
                
                if (Util.isString(pValue)) {
                    Ace.setValue(pValue);
                    CloudCmd.View.show(Element, focus);
                    Key.unsetBind();
                } else
                    Info.getData(function(data) {
                        Value = data;
                        Ace.setValue(data);
                        CloudCmd.View.show(Element, focus);
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
        
        function focus() {
            Ace.focus();
            Ace.clearSelection();
            Ace.moveCursorTo(0, 0);
        }
        
        function initAce() {
            Ace     = ace.edit(Element);
            Session = Ace.getSession();
            
            Ace.setTheme('ace/theme/tomorrow_night_blue');
            
            Ace.setShowPrintMargin(false);
            Ace.setShowInvisibles(true);
            Session.setUseSoftTabs(true);
            
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
            
            Ace.setOptions({
                enableBasicAutocompletion   : true,
                enableSnippets              : true
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
        
        this.showMessage    = function(text) {
            var parent, 
                TWO_SECONDS = 2000;
            
            if (!Msg) {
                DOM.cssSet({
                    id      : 'msg-css',
                    inner   : '#view .msg {'        +
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
            setTimeout(Util.retExec(DOM.hide, Msg), 2000);
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

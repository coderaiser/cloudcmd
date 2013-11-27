var CloudCmd, Util, DOM, CloudFunc, ace, DiffProto, diff_match_patch;
(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Edit = EditProto;
        
    function EditProto(CallBack) {
        var Name        = 'Edit',
            Loading     = false,
            DIR         = CloudCmd.LIBDIRCLIENT + 'edit/',
            LIBDIR      = CloudCmd.LIBDIR,
            Value,
            Edit        = this,
            Diff,
            Ace,
            Session,
            Modelist,
            Msg,
            Dialog      = DOM.Dialog,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            Element;
            
       function init() {
            var lFunc, lIsFunc = Util.isFunction(CloudCmd.View);
            
            Loading   = true;
            if (lIsFunc)
                lFunc = CloudCmd.View;
            else
                lFunc = Util.exec;
            
            Util.loadOnLoad([
                Edit.show,
                load,
                lFunc
            ]);
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('f4', Edit.show);
        }
        
        this.show                       = function(pValue) {
            var lMode,
                lName       = DOM.getCurrentName(),
                lExt        = Util.getExtension(lName);
            
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
                
                if (!Modelist)
                    Modelist = ace.require('ace/ext/modelist');
                
                if (DOM.isCurrentIsDir())
                    lMode = Modelist.modesByName.json.mode
                else
                    lMode = Modelist.getModeForPath(lName).mode;
                Session.setMode(lMode);
                
                if (Util.isString(pValue)) {
                    Ace.setValue(pValue);
                    CloudCmd.View.show(Element, focus);
                    Key.unsetBind();
                } else {
                    DOM.getCurrentData({
                        success    : function(pData) {
                            var lValue = '';
                            
                            if (pData)
                                lValue = pData.data;
                            
                            Value = lValue;
                            Ace.setValue(lValue);
                            CloudCmd.View.show(Element, focus);
                        }
                    });
                }
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
        }
        
        function save () {
            var lPath       = DOM.getCurrentPath(),
                lValue      = Ace.getValue();
            
            CloudCmd.getConfig(function(config) {
                var isDiff = config.diff;
                
                Util.ifExec(!isDiff, function(patch) {
                    var query,
                        isString    = Util.isString(patch),
                        length      = isString && patch.length < lValue.length;
                    
                    Value       = lValue;
                    
                    if (isString && length) {
                        lValue  = patch;
                        query   = '?patch';
                    }
                    
                    DOM.checkStorageHash(lPath, function(error, equal) {
                        if (!error) {
                            if (!equal)
                                query = '';
                            
                            DOM.RESTful.save(lPath,  lValue, onSave, query);
                        }
                    });
                    
                }, function(callback) {
                    diff(lValue, callback);
                });
            });
        }
        
        function diff(pNewValue, pCallBack) {
            var libs = [
                    LIBDIR + 'diff.js',
                    LIBDIR + 'diff/diff-match-patch.js'
                ],
                url = CloudFunc.getCombineURL(libs);
            
            DOM.jsload(url, function() {
                var patch;
                
                if (!Diff)
                    Diff    = new DiffProto(diff_match_patch);
                
                patch       = Diff.createPatch(Value, pNewValue);
                
                Util.exec(pCallBack, patch);
            });
        }
        
        function load(pCallBack) {
            Util.time(Name + ' load');
            
            var lFiles  = [
                DIR + 'theme-tomorrow_night_blue.js',
                DIR + 'ext-language_tools.js',
                DIR + 'ext-searchbox.js',
                DIR + 'ext-modelist.js',
            ],
                lAce    = DIR + 'ace.js',
                lURL    = CloudFunc.getCombineURL(lFiles);
            
            
            DOM.anyLoadOnLoad([lURL, lAce], function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                Util.exec(pCallBack);
            });
        }
        
        function listener(pEvent) {
            var lF4, lKey, lIsBind = Key.isBind();
            
            if (lIsBind) {
                lF4     = Key.F4,
                lKey    = pEvent.keyCode;
                                
                if(lKey === lF4)
                    Edit.show();
            }
        }
        
        function onSave(text, hash) {
            var ret,
                isError = Util.isContainStrAtBegin(text, 'error'),
                path    = DOM.getCurrentPath(),
                msg     = '\nShould I save file anyway?';
                
            if (!isError) {
                Edit.showMessage(text);
                DOM.saveDataToStorage(path, Value);
            } else {
                ret     = Dialog.confirm(text + msg);
                
                if (ret)
                    DOM.RESTful.save(path, Value, onSave);
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

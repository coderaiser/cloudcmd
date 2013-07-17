var CloudCmd, Util, DOM, JsDiff, ace;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Edit = new EditProto(CloudCmd, Util, DOM);
        
    function EditProto(CloudCmd, Util, DOM){
        var Name        = 'Edit',
            Value,
            Edit        = this,
            Ace,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            
            Element;
            
       this.init                = function(pCallBack) {
            var lFunc, lIsFunc = Util.isFunction(CloudCmd.View);
            
            if( lIsFunc)
                lFunc = CloudCmd.View;
            else
                lFunc = Util.exec;
            
            Util.loadOnLoad([
                Edit.show,
                load,
                lFunc
            ]);
            
            DOM.Events.addKey(listener);
            
            delete Edit.init;
        };
        
        this.show                       = function(pValue) {
            var lMode, lSession;
            
            Images.showLoad();
            
            if (!Element) {
                Element         = DOM.anyload({
                    name        : 'div',
                    className   : 'edit',
                    style   :
                        'width      : 100%;'    +
                        'height     : 100%;'    +
                        'font       : 16px "Droid Sans Mono";' +
                        'position: absolute;',
                    not_append : true
                });
                
                Ace         = ace.edit(Element);
                lSession    = Ace.getSession();
                
                Ace.setTheme('ace/theme/tomorrow_night_blue');
                lSession.setMode('ace/mode/javascript');
                Ace.setShowPrintMargin(false);
                Ace.setShowInvisibles(true);
                lSession.setUseSoftTabs(true);
                
                Ace.commands.addCommand({
                    name    : 'hide',
                    bindKey : { win: 'Esc',  mac: 'Esc' },
                    exec    : function () {
                        Edit.hide();
                    }
                });
                
                Ace.commands.addCommand({
                    name    : 'save',
                    bindKey : { win: 'Ctrl-S',  mac: 'Command-S' },
                    exec    : function (pEditor) {
                        var lCurrent    = DOM.getCurrentFile(),
                            lPath       = DOM.getCurrentPath(lCurrent),
                            lName       = DOM.getCurrentName(lCurrent),
                            lValue      = Ace.getValue(),
                            lLength     = lValue.length;
                        
                        if ( Util.strCmp(Value, lValue) )
                            Util.log('edit: nothing to save');
                        else {
                            DOM.setCurrentSize( lLength, lCurrent );
                            
                            diff(lName, lValue, function(pDiff) {
                                var lData,
                                    lPatch      = '',
                                    lDiffLength = pDiff.length;
                                
                                if (lDiffLength >= lLength)
                                    lData   = lValue;
                                else {
                                    lData   = pDiff;
                                    lPatch  = '?patch';
                                }
                                
                                DOM.RESTfull.save( lPath,  lData, null, lPatch);
                            });
                        }
                    }
                });
            }
            
            if ( Util.isString(pValue) ) {
                Ace.setValue(pValue);
                CloudCmd.View.show(Element, focus);
                Key.unsetBind();
            }
            else {
                DOM.getCurrentData({
                    success    : function(pData){
                        var lValue = '';
                        
                        if (pData)
                            lValue = pData.data;
                        
                        Value = lValue;
                        Ace.setValue(lValue);
                        CloudCmd.View.show(Element, focus);
                    }
                });
            }
        };
        
        this.hide                       =  function(){
            CloudCmd.View.hide();
        };
        
        function focus() {
            Ace.focus();
            Ace.clearSelection();
            Ace.moveCursorTo(0, 0);
        }
        
        function diff(pName, pNewValue, pCallBack){
            DOM.jsload('/lib/util/jsdiff/diff.js', function(){
                var lPatch  = JsDiff.createPatch(pName, Value, pNewValue);
                
                Util.exec(pCallBack, lPatch);
            });
        }
        
        function load(pCallBack){
            Util.time(Name + ' load');
            
            var lDir    =  CloudCmd.LIBDIRCLIENT + 'edit/',
                
                lFiles  = [
                    lDir + 'mode-javascript.js',
                    lDir + 'worker-javascript.js',
                    lDir + 'ace.js',
                ];
            
            DOM.anyLoadOnLoad(lFiles, function(){
                Util.timeEnd(Name + ' load');
                
                Util.exec(pCallBack);
            });
        }
        
         function listener(pEvent){
            var lF4, lKey, lIsBind = Key.isBind();
            
            if (lIsBind) {
                lF4     = Key.F4,
                lKey    = pEvent.keyCode;
                                
                if(lKey === lF4)
                    Edit.show();
            }
        }
    }
    
})(CloudCmd, Util, DOM);

var CloudCmd, Util, DOM, CloudFunc, JsDiff, ace;
(function(CloudCmd, Util, DOM, CloudFunc){
    'use strict';
    
    CloudCmd.Edit = new EditProto(CloudCmd, Util, DOM, CloudFunc);
        
    function EditProto(CloudCmd, Util, DOM, CloudFunc){
        var Name        = 'Edit',
            Loading     = false,
            DIR         =  CloudCmd.LIBDIRCLIENT + 'edit/',
            Value,
            Edit        = this,
            Ace,
            Msg,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            
            Element;
            
       this.init                = function(pCallBack) {
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
            
            delete Edit.init;
        };
        
        this.show                       = function(pValue) {
            var lName       = DOM.getCurrentName(),
                lExt        = Util.getExtension(lName),
                lUseWorker  = Util.strCmp(lExt, ['.js', '.json']);
            
            if (!Loading) {
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
                  
                  initAce();
                }
                
                Ace.session.setOption('useWorker', lUseWorker);
                
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
        
        function initAce() {
            var lSession;
            
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
                    var lPath       = DOM.getCurrentPath(),
                        lValue      = Ace.getValue();
                    
                    DOM.RESTfull.save(lPath,  lValue, Edit.showMessage);
                }
            });
        }
        
        function load(pCallBack){
            Util.time(Name + ' load');
            
            var lFiles  = [
                    DIR + 'theme-tomorrow_night_blue.js',
                    DIR + 'ace.js',
                ];
            
            DOM.anyLoadOnLoad(lFiles, function(){
                Util.timeEnd(Name + ' load');
                Loading = false;
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
        
        this.showMessage    = function(text) {
            var parent, 
                TWO_SECONDS = 2000;
            
            if (!Msg) {
                DOM.cssSet({
                    id      : 'msg-css',
                    inner   : '.msg {'              +
                                'z-index'           + ': 1;'                    +
                                'background-color'  + ': white;'                +
                                'color'             + ': rgb(49, 123, 249);'    +
                                'position'          + ': fixed;'                +
                                'left'              + ': 40%;'                  +
                                'padding'           + ': 5px;'                  +
                                'opacity'           + ': 0.9;'                  +
                                'transition'        + ': ease 0.5s;'            +
                            '}'
                });
                parent  = Element;//.parentElement;
                
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
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

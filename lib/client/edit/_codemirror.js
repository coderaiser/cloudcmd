var CloudCmd, Util, DOM, CodeMirror;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Edit = new EditProto(CloudCmd, Util, DOM);
    
    function EditProto(CloudCmd, Util, DOM){
        var Key         = CloudCmd.Key,
            Edit        = this,
            FM,
            Element,
            Loading     = false,
            ReadOnly    = false,
            
            CallBacks = [
                hide,
                init,
                show,
                load
            ];
        
       /**
         * function calls all CodeMirror editor functions
         */
        this.show          = function(){
            DOM.Images.showLoad();
            Util.loadOnLoad( CallBacks );
        };
        /**
         * function hides CodeMirror editor
         */
        this.hide           =  hide;
        
        this.init            = function(){
            Edit.show();
            CallBacks.pop();
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('f4', Edit.show);
        };
        
        function listener(pEvent){
            var lF4, lKey, lIsBind = Key.isBind();
            
            if (lIsBind) {
                lF4     = Key.F4,
                lKey    = pEvent.keyCode;
                                
                if(lKey === lF4)
                    Edit.show();
            }
        }
        
        function setCSS(){
            var lPosition   = DOM.getPanel().id,
                lRet        = DOM.cssSet({
                    id      : 'edit-css',
                    inner   : '.CodeMirror{'                                        +
                                    'font-family'   + ': \'Droid Sans Mono\';'      +
                                    'font-size'     + ': 15px;'                     +
                                '}'                                                 +
                                '.CodeMirror-scroll{'                               +
                                    'height'        + ':' + CloudCmd.HEIGHT + 'px'  +
                                '}'                                                 +
                                '#edit{'                                +
                                    'float'         + ':' + lPosition               +
                                '}'
                });
            
            return lRet;
        }
        
        /**
         * function initialize CodeMirror
         * @param {value, callback}
         */
        function init(pParams){
            if(!FM)
                FM          = DOM.getFM();
            
            var lCSS        = setCSS(),
                lCurrent    = DOM.getCurrentFile(),
                lPath       = DOM.getCurrentPath( lCurrent );
            
            Element = DOM.anyload({
                name        : 'div',
                id          : 'edit',
                className   : 'panel',
                parent      : FM
            });
            
            var lEdit = Edit.CodeMirror = new CodeMirror(Element, {
                mode        : 'javascript',
                value       : pParams && pParams.data && pParams.data.data,
                theme       : 'night',
                lineNumbers : true,
                lineWrapping: false,
                autofocus   : true,
                extraKeys: {
                    /* Exit */
                    'Esc': function(){
                        Util.exec(pParams);
                        DOM.remove(lCSS, document.head);
                    },
                    
                    /* Save */
                    'Ctrl-S': function(){
                        var lValue = lEdit.getValue();
                        
                        DOM.setCurrentSize( lValue.length, lCurrent );
                        DOM.RESTfull.save( lPath,  lValue );
                     }
                },
                readOnly    : ReadOnly
            });
        }
        
        /**
         * function loads CodeMirror js and css files 
         */
        function load(pCallBack){
            Util.time('codemirror load');
            var lDir    = CloudCmd.LIBDIRCLIENT + 'edit/codemirror/',
                lFiles  =
                    [
                        [
                            lDir + 'codemirror.css',
                            lDir + 'theme/night.css',
                            lDir + 'mode/javascript.js',
                        ],
                        
                        lDir + 'codemirror.js'
                    ];
            
            DOM.anyLoadOnLoad(lFiles, function(){
                Util.timeEnd('codemirror load');
                Util.exec(pCallBack);
            });
        }
        
        /**
         * function shows CodeMirror editor
         */
        function show(pCallBack){
            
            /* if CodeMirror function show already
             * called do not call it again
             * if f4 key pressed couple times
             */
            if(!Loading){
                /* checking is this link is to directory 
                 * when folder view is no need to edit data */
                ReadOnly = DOM.isCurrentIsDir();
                
                Loading = true;
                
                setTimeout(lFalseLoading, 400);
                
                DOM.getCurrentData({
                    error      : lFalseLoading,
                    success    : function(data){
                        if( DOM.hidePanel() ){
                            Util.exec(pCallBack, data);
                            Key.unsetBind();
                        }
                        
                        DOM.Images.hideLoad();
                        lFalseLoading();
                    }
                });
            }
            
            function lFalseLoading(){ Loading = false; }
        }
        
        /**
         * function hides CodeMirror editor
         */
        function hide() {
            Key.setBind();
            
            if(Element && FM)
                FM.removeChild(Element);
            
            DOM.showPanel();
        }
    }

})(CloudCmd, Util, DOM);

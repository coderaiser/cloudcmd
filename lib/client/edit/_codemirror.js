var CloudCmd, Util, DOM, CodeMirror;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var Key         = CloudCmd.Key,
        Edit        = {},
        FM,
        Element,
        Loaded      = false,
        Loading     = false,
        ReadOnly    = false,
        
        CallBacks = [
            hide,
            init,
            show,
            load
        ];
    
    function setCSS(){
        var lPosition   =  DOM.getPanel().id,
            lRet        = DOM.cssSet({
                id      : 'editor-css',
                inner   : '.CodeMirror{'                                        +
                                'font-family'   + ': \'Droid Sans Mono\';'      +
                                'font-size'     + ': 15px;'                     +
                            '}'                                                 +
                            '.CodeMirror-scroll{'                               +
                                'height'        + ':' + CloudCmd.HEIGHT + 'px'  +
                            '}'                                                 +
                            '#editor{'                                +
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
            id          : 'editor',
            className   : 'panel',
            parent      : FM
        });
        
        var lEditor = Edit.CodeMirror = new CodeMirror(Element, {
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
                    var lValue = lEditor.getValue();
                    
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
            Loaded = true;
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
    
    /**
     * function calls all CodeMirror editor functions
     */
    Edit.show           = function(){
        DOM.Images.showLoad();
        Util.loadOnLoad( CallBacks );
    };
    
    /**
     * function hides CodeMirror editor
     */
    Edit.hide           =  hide;
    
    /**
     * function bind keys
     */
    CloudCmd.Edit.init            = function(){
        Edit.show();
        CallBacks.pop();
        
        /* добавляем обработчик клавишь */
        DOM.Events.addKey(lListener);
        DOM.setButtonKey('f4', Edit.show);
        
        function lListener(pEvent){
            var lIsBind = Key.isBind();
            
            if (lIsBind) {
                var lF4     = Key.F4,
                    lKey    = pEvent.keyCode;
                                
                if(lKey === lF4)
                    Edit.show();
            }
        }
        
        CloudCmd.Edit = Edit;
    };

})(CloudCmd, Util, DOM);

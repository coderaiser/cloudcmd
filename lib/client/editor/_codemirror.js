var CloudCommander, Util, DOM, CodeMirror;
/* object contains editors CodeMirror */
 (function(CloudCmd, Util, DOM){
    'use strict';
    
    var KeyBinding                  = CloudCommander.KeyBinding,
        CodeMirrorEditor            = {},
        FM,
        CodeMirrorElement,
        CodeMirrorLoaded            = false,
        /* indicator says CodeMirror still loads */
        Loading                     = false,
        ReadOnly                    = false,
        
        CallBacks = [
            hide,
            initCodeMirror,
            show,
            load
        ];
    
    CloudCmd.Editor                 = {
        get : (function(){
            return this.CodeMirror;
        })
    };
    
    /* private functions */
    
    function setCSS(){
        var lPosition   =  DOM.getPanel().id,
            lRet        = DOM.cssSet({
                id      : 'editor',
                inner   : '.CodeMirror{'                                        +
                                'font-family'   + ': \'Droid Sans Mono\';'      +
                                'font-size'     + ': 15px;'                     +
                            '}'                                                 +
                            '.CodeMirror-scroll{'                               +
                                'height'        + ':' + CloudCmd.HEIGHT + 'px'  +
                            '}'                                                 +
                            '#CodeMirrorEditor{'                                +
                                'float'         + ':' + lPosition               +
                            '}'
            });
        
        return lRet;
    }
    
    /**
     * function initialize CodeMirror
     * @param {value, callback}
     */
    function initCodeMirror(pParams){
        if(!FM)
            FM          = DOM.getFM();
        
        var lCSS        = setCSS(),
            lCurrent    = DOM.getCurrentFile(),
            lPath       = DOM.getCurrentPath( lCurrent );
        
        CodeMirrorElement = DOM.anyload({
            name        : 'div',
            id          : 'CodeMirrorEditor',
            className   : 'panel',
            parent      : FM
        });
        
        var lEditor = CodeMirrorEditor.CodeMirror = new CodeMirror(CodeMirrorElement,{
            mode        : 'javascript',
            value       : pParams && pParams.data && pParams.data.data,
            theme       : 'night',
            lineNumbers : true,
            //переносим длинные строки
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
        var lDir    = CloudCmd.LIBDIRCLIENT + 'editor/codemirror/',
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
            CodeMirrorLoaded = true;
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
            
            var lFalseLoading = function(){ Loading = false; };
            
            setTimeout(lFalseLoading, 400);
            
            DOM.getCurrentData({
                error      : lFalseLoading,
                success    : function(data){
                    if( DOM.hidePanel() ){
                        Util.exec(pCallBack, data);
                        KeyBinding.unSet();
                    }
                    
                    DOM.Images.hideLoad();
                    lFalseLoading();
                }
            });
        }
    }
    
    /**
     * function hides CodeMirror editor
     */
    function hide() {
        var lElem = CodeMirrorElement;
        KeyBinding.set();
        
        if(lElem && FM)
            FM.removeChild(lElem);
        
        DOM.showPanel();
    }
    
    /**
     * function calls all CodeMirror editor functions
     */
    CodeMirrorEditor.show           = function(){
        DOM.Images.showLoad();
        Util.loadOnLoad( CallBacks );
    };
    
    /**
     * function hides CodeMirror editor
     */
    CodeMirrorEditor.hide           =  hide;
    
    /**
     * function bind keys
     */
    CloudCmd.Editor.init            = function(pReadOnly){
        ReadOnly = pReadOnly;
        
        CodeMirrorEditor.show();
        CallBacks.pop();
        
        var lKeyListener = function(pEvent){    
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if f4 or f3 pressed */
                var lF3 = CloudCmd.KEY.F3,
                    lF4 = CloudCmd.KEY.F4;
                                
                if(!pEvent.shiftKey)
                    switch(pEvent.keyCode)
                    {
                        case lF4:
                            ReadOnly = false;
                            CodeMirrorEditor.show();
                            break;
                        case lF3:
                            ReadOnly = true;
                            CodeMirrorEditor.show();
                            break;
                    }
            }
        };
       
        /* добавляем обработчик клавишь */
        DOM.addKeyListener( lKeyListener );
        DOM.setButtonKey('f4', CodeMirrorEditor.show);
    };
    
    CloudCmd.Editor.CodeMirror      = CodeMirrorEditor;

})(CloudCommander, Util, DOM);
var CloudCommander, Util, DOM, CodeMirror;
/* object contains editors CodeMirror */
 (function(){
    "use strict";
    var cloudcmd                    = CloudCommander,
        KeyBinding                  = CloudCommander.KeyBinding,
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
    
    cloudcmd.Editor                 = {
        get : (function(){
            return this.CodeMirror;
        })
    };
    
    /* private functions */
    
    function setCSS(){
        var lPosition =  DOM.getPanel().id,
            lRet = DOM.cssSet({
            id      : 'editor',
            inner   : '.CodeMirror{'                                        +
                            'font-family'   + ': \'Droid Sans Mono\';'      +
                            'font-size'     + ': 15px;'                     +
                        '}'                                                 +
                        '.CodeMirror-scroll{'                               +
                            'height'        + ':' + cloudcmd.HEIGHT + 'px'  +
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
            FM = DOM.getFM();
        
        var lCSS = setCSS();
        
        CodeMirrorElement = DOM.anyload({
            name        : 'div',
            id          : 'CodeMirrorEditor',
            className   : 'panel',
            parent      : FM
        });
        
        CodeMirrorEditor.CodeMirror = new CodeMirror(CodeMirrorElement,{
            mode        : 'javascript',
            value       : pParams && pParams.data && pParams.data.data,
            theme       : 'night',
            lineNumbers : true,
            //переносим длинные строки
            lineWrapping: false,
            autofocus   : true,
            extraKeys: {
              //Сохранение
                'Esc': function(){
                    Util.exec(pParams);
                    DOM.remove(lCSS, document.head);
                }
            },
            readOnly    : ReadOnly
        });
    }
    
    /**
     * function loads CodeMirror js and css files 
     */
    function load(pCallBack){
        console.time('codemirror load');
        var lDir    = cloudcmd.LIBDIRCLIENT + 'editor/codemirror/',
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
            console.timeEnd('codemirror load');
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
        if(Loading)
            return;
        
        /* checking is this link is to directory 
         * when folder view is no need to edit data
         */
        if ( DOM.getCurrentSize() === '<dir>' )
            ReadOnly = true;
        
        Loading = true;
        
        var lFalseLoading = function(){ Loading = false; };
        
        setTimeout(lFalseLoading, 400);
        /* reading data from current file */
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
    cloudcmd.Editor.init            = function(pReadOnly){
        ReadOnly = pReadOnly;
        
        CodeMirrorEditor.show();
        CallBacks.pop();
        
        var lKeyListener = function(pEvent){    
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if f4 or f3 pressed */
                var lF3 = cloudcmd.KEY.F3,
                    lF4 = cloudcmd.KEY.F4;
                                
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
    
    cloudcmd.Editor.CodeMirror      = CodeMirrorEditor;
})();
var CloudCommander, Util, DOM, CloudFunc, CodeMirror;
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
        ReadOnly                    = false;
    
    cloudcmd.Editor                 = {
        get : (function(){
            return this.CodeMirror;
        })
    };
    
    /* private functions */
    
    function setCSS(){
        return DOM.cssSet({
            id      : 'editor',
            inner   : '.CodeMirror{'                                        +
                            'font-family'   + ': \'Droid Sans Mono\';'      +
                            'font-size'     + ': 15px;'                     +
                            /* codemirror v3 */
                            //'height      : ' + cloudcmd.HEIGHT + 'px'     +
                        '}'                                                 +
                        '.CodeMirror-scroll{'                               +
                            'height'        + ':' + cloudcmd.HEIGHT + 'px'  +
                        '}'                                                 +
                        '#CodeMirrorEditor{'                                +
                            'float'         + ':' + DOM.getPanel().id       +
                        //    'padding        :20px 20px 20px 20px;'        +
                        '}'
        });
    }
    
    /**
     * function initialize CodeMirror
     * @param {value, callback}
     */
    function initCodeMirror(pData){
        if(!pData)
            pData = {};
        
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
            value       : pData.data,
            theme       : 'night',
            lineNumbers : true,
            //переносим длинные строки
            lineWrapping: false,
            autofocus   : true,
            extraKeys: {
              //Сохранение
                'Esc': function(){
                    DOM.remove(lCSS, document.head);
                    Util.exec(pData.callback);
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
        var lDir = cloudcmd.LIBDIRCLIENT + 'editor/codemirror/';
        
        DOM.jsload(lDir + 'codemirror.js', function(){
            DOM.anyLoadInParallel([
                lDir + 'codemirror.css',
                lDir + 'theme/night.css',
                lDir + 'mode/javascript.js',
                ],
                
                function(){
                    console.timeEnd('codemirror load');
                    CodeMirrorLoaded = true;
                    Util.exec(pCallBack);
                });
        });
        
    }     
        
    /**
     * function shows CodeMirror editor
     */
    CodeMirrorEditor.show           = function(pCallBack){
        
        /* if CodeMirror function show already
         * called do not call it again
         * if f4 key pressed couple times
         */
        if(Loading)
            return;
        
        /* getting link */
        var lCurrentFile = DOM.getCurrentFile(),
            lA = DOM.getCurrentLink(lCurrentFile);
            lA = lA.href;
                    
        /* убираем адрес хоста*/
        lA = lA.replace(cloudcmd.HOST, '');
        
        /* checking is this link is to directory */
        var lSize = DOM.getByClass('size', lCurrentFile);
        if(lSize){
            lSize = lSize[0].textContent;
            
            /* if directory - load json
             * not html data
             */
            if (lSize === '<dir>'){
                var lIndexOfNOJS = lA.indexOf(CloudFunc.NOJS);
                if (lIndexOfNOJS === CloudFunc.FS.length){
                    lA = lA.replace(CloudFunc.NOJS, '');
                    /* when folder view 
                     * is no need to edit
                     * data
                     */
                    ReadOnly = true;
                }
            }
        }
        
        Loading = true;
        setTimeout(function(){
                Loading = false;
            },
            400);
            
        /* reading data from current file */
        DOM.ajax({
            url:lA,
             error: function(jqXHR, textStatus, errorThrown){
                 Loading = false;
                 return DOM.Images.showError(jqXHR);
             },
             
             success:function(data, textStatus, jqXHR){
                /* if we got json - show it */
                if(typeof data === 'object')
                    data = JSON.stringify(data, null, 4);
                
                var lHided = DOM.hidePanel();
                if(lHided){
                    Util.exec(pCallBack, data);
                    
                    /* removing keyBinding if set */
                    KeyBinding.unSet();
                }
                
                DOM.Images.hideLoad();
                
                Loading = false;
            }
        });
    };
    
    /**
     * function hides CodeMirror editor
     */
    CodeMirrorEditor.hide           = function() {
        var lElem = CodeMirrorElement;
        KeyBinding.set();
        
        if(lElem && FM)
            FM.removeChild(lElem);
        
        DOM.showPanel();
    };
    
    /**
     * function bind keys
     */
    cloudcmd.Editor.Keys            = function(pReadOnly){
        ReadOnly = pReadOnly;
        
        var lShowCodemirror = [
            CodeMirrorEditor.hide,
            initCodeMirror,
            CodeMirrorEditor.show,
            load
        ],
            lEditor = function(){
                DOM.Images.showLoad();
                Util.loadOnLoad( lShowCodemirror );
            };
        
        lEditor();
        lShowCodemirror.pop();
        
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
                            lEditor();
                            break;
                        case lF3:
                            ReadOnly = true;
                            lEditor();
                            break;
                    }
            }
        };
       
        /* добавляем обработчик клавишь */
       DOM.addKeyListener( lKeyListener );
       
       DOM.setButtonKey('f4', lEditor);
    };
    
    cloudcmd.Editor.CodeMirror      = CodeMirrorEditor;
})();
var CloudCommander, Util, DOM, CloudFunc, CodeMirror;
/* object contains editors CodeMirror
 * and later will be Ace
 */
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
    
    cloudcmd.Editor.dir             = 'lib/client/editor/';
    CodeMirrorEditor.dir            = cloudcmd.Editor.dir + 'codemirror/';
    
    /* private functions */
    
    /**
     * function initialize CodeMirror
     */
    function initCodeMirror(pValue){
        if(!FM)
            FM = DOM.getById('fm');
        
        CodeMirrorElement = DOM.anyload({
            name        : 'div',
            id          : 'CodeMirrorEditor',
            className   : 'panel',
            parent      : FM
        });
        
        CodeMirrorEditor.CodeMirror = new CodeMirror(CodeMirrorElement,{
            mode        : 'javascript',
            value       : pValue,
            theme       : 'night',
            lineNumbers : true,
            //переносим длинные строки                    
            lineWrapping: false,
            autofocus   : true,
            extraKeys: {
              //Сохранение
              "Esc": CodeMirrorEditor.hide
            },
            readOnly    : ReadOnly
        });
    }
    
    /**
     * function loads CodeMirror js and css files 
     */
    function load(){
        console.time('codemirror load');
        var lDir = CodeMirrorEditor.dir;
        
        DOM.anyLoadOnLoad(
            [{
                name: 'style',
                id:'editor',
                inner : '.CodeMirror{'                                      +
                            'font-family :\'Droid Sans Mono\';'             +
                            'font-size   :15px;'                            +
                            /* codemirror v3 */
                            //'height      : ' + cloudcmd.HEIGHT + 'px'       +
                        '}'                                                 +
                        '.CodeMirror-scroll{'                               +
                            'height      : ' + (cloudcmd.HEIGHT) + 'px'     +
                        '}',                                                 //+
                        /* codemirror v3 */
                        //'#CodeMirrorEditor{'                                +
                        //    'padding        :20px 20px 20px 20px;'          +
                        //    '}'
                parent: document.head
            },
            lDir + 'codemirror.css',
            lDir + 'theme/night.css',
            lDir + 'mode/javascript.js',
            lDir + 'codemirror.js'],
            
            function(){
                console.timeEnd('codemirror load');
                CodeMirrorLoaded = true;                
                CodeMirrorEditor.show();                
            }
        );
    }     
        
    /**
     * function shows CodeMirror editor
     */
    CodeMirrorEditor.show           = function(pReadOnly){        
        if( Util.isBoolean(pReadOnly) )
            ReadOnly = pReadOnly;
        
        /* if CodeMirrorEditor is not loaded - loading him */
        if(!CodeMirrorLoaded)
            return load();
        
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
        lA = '/' + lA.replace(document.location.href,'');
        
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
                    initCodeMirror(data);
                    
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
        
        /* loading js and css of CodeMirror */
        CodeMirrorEditor.show();
        
        var key_event = function(pEvent){
    
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if f4 or f3 pressed */
                var lF3 = cloudcmd.KEY.F3,
                    lF4 = cloudcmd.KEY.F4,
                    lShow = Util.bind( CodeMirrorEditor.show, CodeMirrorEditor );
                                
                if(!pEvent.shiftKey)
                    switch(pEvent.keyCode)
                    {
                        case lF4:
                            ReadOnly = false;
                            lShow();
                            break;
                        case lF3:
                            ReadOnly = true;
                            lShow();
                            break;
                    }
            }
        };
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)
            document.addEventListener('keydown', key_event, false);
                  
        else{
            var lFunc = document.onkeydown;
            document.onkeydown = function(){
                Util.exec(lFunc);
                key_event();
            };
        }
    };
    
    cloudcmd.Editor.CodeMirror      = CodeMirrorEditor;
})();
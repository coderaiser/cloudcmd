var CloudCommander, CloudFunc, CodeMirror;
/* object contains editors CodeMirror
 * and later will be Ace
 */
 (function(){
    "use strict";
    var cloudcmd                    = CloudCommander,
        Util                        = CloudCommander.Util,
        KeyBinding                  = CloudCommander.KeyBinding,
        CodeMirrorEditor            = {},
        CodeMirrorElement;
    
    cloudcmd.Editor                 = {
        get : (function(){
            return this.CodeMirror;
        })
    };
    
    cloudcmd.Editor.dir             = 'lib/client/editor/';
    CodeMirrorEditor.dir            = cloudcmd.Editor.dir + 'codemirror/';
    
    /* indicator says CodeMirror still loads */
    CodeMirrorEditor.loading        = false;
    
    /* function loads CodeMirror js and css files */
    CodeMirrorEditor.load           = (function(pCurrentFile, pIsReadOnly){
        /* function shows editor */
        var lThis = this;
        var createEditorDiv = function(){
            if (!CodeMirrorElement) {
                var lFM = Util.getById('fm');
                if(lFM)
                    CodeMirrorElement = Util.anyload({
                        name    : 'div',
                        id      : 'CodeMirrorEditor',
                        parent : lFM
                    });
                else
                    console.log('Error. Something went wrong FM not found');
                
                lThis.show(pCurrentFile, pIsReadOnly);
            }
        };
        /* function loads css files
         * of CodeMirror
         */
        var loadAll = function() {
            Util.cssLoad([
                { src : CodeMirrorEditor.dir + 'codemirror.css'},
                { src : CodeMirrorEditor.dir + 'theme/night.css'}
            ]);
          
          
            Util.cssSet({id:'editor',
                inner : '.CodeMirror{'                                      +
                            'font-family :\'Droid Sans Mono\';'             +
                            'font-size   :15px;'                            +
                            'padding     :20px 0 0 0;'                      +
                        '}'                                                 +
                        '.CodeMirror-scroll{'                               +
                            'height      : ' + (cloudcmd.HEIGHT-40) + 'px'  +
                        '}'
            });  
                      
            Util.jsload(CodeMirrorEditor.dir + 
                'mode/javascript.js', createEditorDiv);
        };
        
        /* load CodeMirror main module */
        Util.jsload(CodeMirrorEditor.dir + 'codemirror.js', loadAll);
    });
        
     /* function shows CodeMirror editor */
    CodeMirrorEditor.show           = (function(pCurrentFile, pIsReadOnly){
        
        /* if CodeMirrorEditor is not loaded - loading him */
        var lCodeMirrorEditor = Util.getById('CodeMirrorEditor');
        if(!lCodeMirrorEditor)
            return this.load(pCurrentFile, pIsReadOnly);
        
        /* if CodeMirror function show already
         * called do not call it again
         * if f4 key pressed couple times
         */
        if(this.loading)
            return;
                
        /* when folder view 
         * is no need to edit
         * data
         */
        var lReadOnly = pIsReadOnly || false;
        
        var lThis = this;
        
        var initCodeMirror_f = function(pValue){
            lCodeMirrorEditor.className = 'panel';
            new CodeMirror(lCodeMirrorEditor,{
                mode        : 'javascript',
                value       : pValue,
                theme       : 'night',
                lineNumbers : true,
                //переносим длинные строки                    
                lineWrapping: false,
                autofocus   : true,
                extraKeys: {
                  //Сохранение
                  "Esc": lThis.hide
                },
                readOnly    : lReadOnly
            });
        };
                                            
        var lA;
    
        /* getting link */
        lA = Util.getByTag('a', pCurrentFile);
        
        lA = lA[0].href;
                    
        /* убираем адрес хоста*/
        lA = '/' + lA.replace(document.location.href,'');
        
        /* checking is this link is to directory */
        var lSize = Util.getByClass('size', pCurrentFile);
        if(lSize){
            lSize = lSize[0].textContent;
            
            /* if directory - load json
             * not html data
             */
            if (lSize === '<dir>'){
                if (lA.indexOf(CloudFunc.NOJS) ===
                    CloudFunc.FS.length) {                    
                        lA = lA.replace(CloudFunc.NOJS, '');
                        lReadOnly = true;
                }
            }
        }
            
        this.loading = true;
        setTimeout(function(){
            lThis.loading = false;},
            400);
            
        /* reading data from current file */
        Util.ajax({
            url:lA,
             error: (function(jqXHR, textStatus, errorThrown){
                 lThis.loading             = false; 
                 
                 return Util.Images.showError(jqXHR);
             }),
             
             success:function(data, textStatus, jqXHR){                    
                /* if we got json - show it */
                if(typeof data === 'object')
                    data = JSON.stringify(data, null, 4);
                
                initCodeMirror_f(data);
                
                /* removing keyBinding if set */
                KeyBinding.unSet();
                            
                Util.hidePanel();
                Util.Images.hideLoad();
                
                lThis.loading               = false;
            }
        });
    });
    
    /* function hides CodeMirror editor */
    CodeMirrorEditor.hide           = (function() {
        KeyBinding.set();        
        
        if(CodeMirrorElement){
            Util.hide(CodeMirrorElement);
            var lCodeMirror = Util.getByClass('CodeMirror', CodeMirrorElement);
            
            if(lCodeMirror.length)
                CodeMirrorElement.removeChild(lCodeMirror[0]);
        }
        
        Util.showPanel();
    });
    
    cloudcmd.Editor.Keys            = (function(pCurrentFile, pIsReadOnly){
        var lThis = this.CodeMirror;
        /* loading js and css of CodeMirror */
        lThis.show(pCurrentFile, pIsReadOnly);
        
        var key_event = function(pEvent){
    
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if f4 or f3 pressed */
                var lF3 = cloudcmd.KEY.F3;
                var lF4 = cloudcmd.KEY.F4;
                //var lShow = lThis.show.bind(lThis);
                var lShow = Util.bind(lThis.show, lThis);
                
                var lCurrentFile = Util.getCurrentFile();
                
                if(!pEvent.shiftKey){
                    if(pEvent.keyCode === lF4)
                        lShow(lCurrentFile);
                    else if(pEvent.keyCode === lF3){
                        lShow(lCurrentFile, true);
                    }
                }
            }
        };
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event,false);        
                  
        else{
            var lFunc;
            if(typeof document.onkeydown === 'function')
                lFunc = document.onkeydown;
            
            document.onkeydown = function(){
                if(lFunc)
                    lFunc();
                
                key_event();
            };
        }
    });
    
    cloudcmd.Editor.CodeMirror      = CodeMirrorEditor;
})();
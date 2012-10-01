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
    function initCodeMirror(pValue){
        if(!FM)
            FM = Util.getById('fm');
        
        CodeMirrorElement = Util.anyload({
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
    
    cloudcmd.Editor.dir             = 'lib/client/editor/';
    CodeMirrorEditor.dir            = cloudcmd.Editor.dir + 'codemirror/';
    
    /* function loads CodeMirror js and css files */
    CodeMirrorEditor.load           = (function(){
        /* function loads css files of CodeMirror */
        var loadAll = function() {
            Util.cssLoad([
                { src : CodeMirrorEditor.dir + 'codemirror.css'},
                { src : CodeMirrorEditor.dir + 'theme/night.css'}
            ]);
          
          
            Util.cssSet({id:'editor',            
                inner : '.CodeMirror{'                                      +
                            'font-family :\'Droid Sans Mono\';'             +
                            'font-size   :15px;'                            +
                            /* codemirror v3 */
                            //'height      : ' + cloudcmd.HEIGHT + 'px'       +
                        '}'                                                 +
                        '.CodeMirror-scroll{'                               +
                            'height      : ' + (cloudcmd.HEIGHT) + 'px'  +
                        '}'                                                 //+
                        /* codemirror v3 */
                        //'#CodeMirrorEditor{'                                +
                        //    'padding        :20px 20px 20px 20px;'          +
                        //    '}'
            });  
                      
            Util.jsload(CodeMirrorEditor.dir + 
                'mode/javascript.js', function(){
                        CodeMirrorLoaded = true;
                        CodeMirrorEditor.show();
                    });
        };
        
        /* load CodeMirror main module */
        Util.jsload(CodeMirrorEditor.dir + 'codemirror.js', loadAll);
    });
        
     /* function shows CodeMirror editor */
    CodeMirrorEditor.show           = (function(){        
        /* if CodeMirrorEditor is not loaded - loading him */
        if(!CodeMirrorLoaded)
            return this.load();
        
        /* if CodeMirror function show already
         * called do not call it again
         * if f4 key pressed couple times
         */
        if(Loading)
            return;
        
        /* getting link */
        var lCurrentFile = Util.getCurrentFile(),
            lA = Util.getCurrentLink(lCurrentFile);
            lA = lA.href;
                    
        /* убираем адрес хоста*/
        lA = '/' + lA.replace(document.location.href,'');
        
        /* checking is this link is to directory */
        var lSize = Util.getByClass('size', lCurrentFile);
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
        Util.ajax({
            url:lA,
             error: function(jqXHR, textStatus, errorThrown){
                 Loading = false;
                 return Util.Images.showError(jqXHR);
             },
             
             success:function(data, textStatus, jqXHR){                    
                /* if we got json - show it */
                if(typeof data === 'object')
                    data = JSON.stringify(data, null, 4);
                
                initCodeMirror(data);
                
                /* removing keyBinding if set */
                KeyBinding.unSet();
                            
                Util.hidePanel();
                Util.Images.hideLoad();
                
                Loading = false;
            }
        });
    });
    
    /* function hides CodeMirror editor */
    CodeMirrorEditor.hide           = (function() {
        var lElem = CodeMirrorElement;
        KeyBinding.set();
        
        if(lElem && FM)
            FM.removeChild(lElem);
        
        Util.showPanel();
    });
    
    cloudcmd.Editor.Keys            = (function(pIsReadOnly){
        ReadOnly = pIsReadOnly;
        
        var lThis = this.CodeMirror;
        /* loading js and css of CodeMirror */
        lThis.show();
        
        var key_event = function(pEvent){
    
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if f4 or f3 pressed */
                var lF3 = cloudcmd.KEY.F3;
                var lF4 = cloudcmd.KEY.F4;
                //var lShow = lThis.show.bind(lThis);
                var lShow = Util.bind(lThis.show, lThis);
                                
                if(!pEvent.shiftKey){
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
            }
        };
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event, false);        
                  
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
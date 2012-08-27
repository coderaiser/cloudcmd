var CloudCommander, CloudFunc, CodeMirror;
/* object contains editors CodeMirror
 * and later will be Ace
 */
 (function(){
    "use strict";
    
    var Util                            = CloudCommander.Util;
    
    CloudCommander.Editor               = {
        get : (function(){
            return this.CodeMirror;
        })
    };
    CloudCommander.Editor.CodeMirror    = {};
    
    /* indicator says CodeMirror still loads */
    CloudCommander.Editor.CodeMirror.loading = false;
    
    /* function loads CodeMirror js and css files */
    CloudCommander.Editor.CodeMirror.load = (function(pCurrentFile, pIsReadOnly){
        /* function shows editor */
        var lThis = this;
        var createEditorDiv = function(){
            if (!Util.getById('CloudEditor')) {
                var lFM = Util.getById('fm');
                if(lFM)
                    Util.anyload({
                        name    : 'div',
                        id      : 'CloudEditor',
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
                { src : 'lib/client/editor/codemirror/codemirror.css'},
                { src : 'lib/client/editor/codemirror/theme/night.css'}
            ]);
          
          
            Util.cssSet({id:'editor',
                inner : '.CodeMirror{'                          +
                            'font-family :\'Droid Sans Mono\';' +
                            'font-size   :15px;'                +
                            'padding     :20px;'                +
                        '}'                                     +
                        '.CodeMirror-scroll{'                   +
                            'height      : 660px;'              +
                        '}'
            });  
                      
            Util.jsload('lib/client/editor/'                    +
                'codemirror/mode/javascript.js',
                createEditorDiv);
    };
    
    /* load CodeMirror main module */
    Util.jsload('lib/client/editor/'                            +
        'codemirror/codemirror.js', loadAll);
    });
        
     /* function shows CodeMirror editor */
    CloudCommander.Editor.CodeMirror.show = (function(pCurrentFile, pIsReadOnly){
        /* if CloudEditor is not loaded - loading him */
        var lCloudEditor = Util.getById('CloudEditor');
        if(!lCloudEditor)
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
            new CodeMirror(lCloudEditor,{
                mode        : 'javascript',
                value       : pValue,
                theme       : 'night',
                lineNumbers : true,
                //переносим длинные строки                    
                lineWrapping: false,
                autofocus   : true,
                extraKeys: {
                  //Сохранение
                  "Esc": lThis.hide(lThis)
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
                CloudCommander.keyBinded    = false;
                            
                Util.hidePanel();
                Util.Images.hideLoad();
                
                lThis.loading               = false;
            }
        });
    });
    
    /* function hides CodeMirror editor */
    CloudCommander.Editor.CodeMirror.hide =  (function() {
        return function(){
            CloudCommander.keyBinded = true;        
            Util.showPanel();        
            
            var lCloudEditor    = Util.getById('CloudEditor');            
            var lCodeMirror = Util.getByClass('CodeMirror');
            
            if(lCodeMirror.length)
                lCloudEditor
                    .removeChild(lCodeMirror[0]);
        };
    });
    
    CloudCommander.Editor.Keys = (function(pCurrentFile, pIsReadOnly){
        "use strict";
              
        var lThis = this.CodeMirror;
        /* loading js and css of CodeMirror */
        this.CodeMirror.show(pCurrentFile, pIsReadOnly);
        
        var key_event = function(pEvent){
    
            /* если клавиши можно обрабатывать */
            if(CloudCommander.keyBinded){
                /* if f4 or f3 pressed */
                var lF3 = CloudCommander.KEY.F3;
                var lF4 = CloudCommander.KEY.F4;
                var lShow = lThis.show.bind(lThis);
                
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
})();
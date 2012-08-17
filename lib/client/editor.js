var CloudCommander, CloudFunc, CodeMirror;
/* object contains editors CodeMirror
 * and later will be Ace
 */
CloudCommander.Editor               = {
    get : (function(){
        return this.CodeMirror;
    })
};
CloudCommander.Editor.CodeMirror    = new CloudCommander.Util();

/* indicator says CodeMirror still loads */
CloudCommander.Editor.CodeMirror.loading = false;

/* function loads CodeMirror js and css files */
CloudCommander.Editor.CodeMirror.load = (function(pThis){
    /* function shows editor */
    var createEditorDiv = function(){
        if (!pThis.getById('CloudEditor')) {
            var lFM = pThis.getById('fm');
            if(lFM)
                pThis.anyload({
                    name    : 'div',
                    id      : 'CloudEditor',
                    parent : lFM
                });
            else
                console.log('Error. Something went wrong FM not found');
            
            pThis.show(pThis);
        }
    };
    /* function loads css files
     * of CodeMirror
     */
    var loadAll = function(pParent) {
        return function(){
            pParent.cssLoad([
                { src : 'lib/client/editor/codemirror/pack/codemirror.pack.css'},
                { src : 'lib/client/editor/codemirror/pack/night.pack.css'}
            ]);
          
          
            pParent.cssSet({id:'editor',
                inner : '.CodeMirror{'                          +
                            'font-family :\'Droid Sans Mono\';' +
                            'font-size   :15px;'                +
                            'padding     :20px;'                +
                        '}'                                     +
                        '.CodeMirror-scroll{'                   +
                            'height      : 660px;'              +
                        '}'
            });  
                      
            pParent.jsload('lib/client/editor/'                 +
                'codemirror/pack/javascript.pack.js',
                createEditorDiv);
        };
    };
    
    /* load CodeMirror main module */
    pThis.jsload('lib/client/editor/'                  +
        'codemirror/pack/codemirror.pack.js',
        loadAll(this));
});
    
 /* function shows CodeMirror editor */
CloudCommander.Editor.CodeMirror.show = (function(pThis, pIsReadOnly){
    /* if CloudEditor is not loaded - loading him */
    if(!pThis.getById('CloudEditor'))
        return pThis.load(pThis);   
    
    /* if CodeMirror function show already
     * called do not call it again
     * if f4 key pressed couple times
     */
    if(pThis.loading)
        return;
            
    /* when folder view 
     * is no need to edit
     * data
     */
    var lReadOnly = pIsReadOnly || false;
    
    var initCodeMirror_f = function(pValue){
        CodeMirror(lCloudEditor,{
            mode        : 'javascript',
            value       : pValue,
            theme       : 'night',
            lineNumbers : true,
            //переносим длинные строки                    
            lineWrapping: false,
            autofocus   : true,
            extraKeys: {
              //Сохранение
              "Esc": pThis.hide(pThis)
            },
            readOnly    : lReadOnly
        });
    };
    
    var lCloudEditor    = pThis.getById('CloudEditor');
                                
    var lCurrent        = pThis.getCurrentFile();
    var lA;

    /* getting link */
    lA = pThis.getByTag('a', lCurrent);                    
    
    lA = lA[0].href;
                
    /* убираем адрес хоста*/
    lA = '/' + lA.replace(document.location.href,'');
    
    /* checking is this link is to directory */
    var lSize = pThis.getByClass('size', lCurrent);
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
        pThis.loading = false;},
        400);
        
    /* reading data from current file */
    $.ajax({
        url:lA,
         error: (function(jqXHR, textStatus, errorThrown){
             pThis.loading             = false; 
             
             return pThis.Images.showError(jqXHR);
         }),
         
         success:function(data, textStatus, jqXHR){                    
            /* if we got json - show it */
            if(typeof data === 'object')
                data = JSON.stringify(data, null, 4);
            
            initCodeMirror_f(data);
            
            /* removing keyBinding if set */
            CloudCommander.keyBinded    = false;
                        
            pThis.hidePanel();
            pThis.Images.hideLoad();
            
            pThis.loading             = false;
        }
    });
});

/* function hides CodeMirror editor */
CloudCommander.Editor.CodeMirror.hide =  (function(pParent) {
    return function(){
        CloudCommander.keyBinded = true;        
        pParent.showPanel();        
        
        var lCloudEditor    = pParent.getById('CloudEditor');            
        var lCodeMirror = pParent.getByClass('CodeMirror');
        
        if(lCodeMirror.length)
            lCloudEditor
                .removeChild(lCodeMirror[0]);
    };
});

CloudCommander.Editor.Keys = (function(pIsReadOnly){
    "use strict";
          
    var lThis = this.CodeMirror;
    /* loading js and css of CodeMirror */
    this.CodeMirror.show(lThis, pIsReadOnly);
    
    var key_event = function(pEvent){

        /* если клавиши можно обрабатывать */
        if(CloudCommander.keyBinded){
            /* if f4 or f3 pressed */
            var lF3 = CloudCommander.KEY.F3;
            var lF4 = CloudCommander.KEY.F4;
            var lShow = CloudCommander.Editor.CodeMirror.show;
            
            if(!pEvent.shiftKey){
                if(pEvent.keyCode === lF4)
                    lShow(lThis);
                else if(pEvent.keyCode === lF3){
                    lShow(lThis, true);
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
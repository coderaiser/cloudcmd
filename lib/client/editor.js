var CloudCommander, CloudFunc, CodeMirror;
/* object contains editors CodeMirror
 * and later will be Ace
 */
CloudCommander.Editor = {};
CloudCommander.Editor.CodeMirror = new CloudCommander.Util()

/* indicator says CodeMirror still loads */
CloudCommander.Editor.CodeMirror.loading = false;

/* function loads CodeMirror js and css files */;
CloudCommander.Editor.CodeMirror.load = (function(pParent){     
    /* function shows editor */
    var createEditorDiv = function(){
        if (!pParent.getById('CloudEditor')) {
            var lFM = document.getElementById('fm');
            if(lFM)
                pParent.anyload({
                    name    : 'div',
                    id      : 'CloudEditor',
                    element : lFM
                });
            else
                console.log('Error. Something went wrong FM not found');
            
            pParent.show();
        }
    };
    /* function loads css files
     * of CodeMirror
     */
    var loadAll = function(pParent) {
        return function(){
            pParent.cssLoad({
                src     : 'lib/client/editor/codemirror/pack/codemirror.pack.css'
            });
          
            pParent.cssLoad({
                src     : 'lib/client/editor/codemirror/pack/night.pack.css'
            });
          
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
                      
            pParent.jsload('lib/client/editor/'          +
                'codemirror/pack/javascript.pack.js',
                createEditorDiv);
        };
    };
    
    /* load CodeMirror main module */
    pParent.jsload('lib/client/editor/'                  +
        'codemirror/pack/codemirror.pack.js',
        loadAll(this));
});
    
 /* function shows CodeMirror editor */
CloudCommander.Editor.CodeMirror.show = (function(){
    /* if CloudEditor is not loaded - loading him */
    if(!this.getById('CloudEditor'))
        return this.load(this);   
    
    /* if CodeMirror function show already
     * called do not call it again
     * if f4 key pressed couple times
     */
    if(this.loading)
        return;
            
    var lParent = this;
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
              "Esc": lParent.hide(lParent)
            }
        });
    };
    
    var lLeft           = this.getById('left');
    var lCloudEditor    = this.getById('CloudEditor');
    var lCURRENTFILE    = CloudCommander.CURRENT_FILE;
    
                            
    var lCurrent        = this.getByClass(lCURRENTFILE);
    var lA;
    if(lCurrent.length){
        lCurrent = lCurrent[0];
        
        /* getting link */
        lA = lCurrent.getElementsByTagName('a');                    
        if(!lA.length)
            return console.log('Error:' + 
                'can not find links in current file');
        
        lA = lA[0].href;                
        /* убираем адрес хоста*/
        lA = '/' + lA.replace(document.location.href,'');
        
        /* checking is this link is to directory */
        var lSize = lCurrent.getElementsByClassName('size');
        if(lSize){
            lSize = lSize[0].textContent;
            
            /* if directory - load json
             * not html data
             */
            if (lSize === '<dir>'){
                if (lA.indexOf(CloudFunc.NOJS) ===
                    CloudFunc.FS.length){
                    lA = lA.replace(CloudFunc.NOJS, '');
                }
            }
        }                
    }
    
    /* показываем гиф загрузки возле пути папки сверху*/
    var lLoadingImage       = CloudCommander._images.loading();
    var lErrorImage         = CloudCommander._images.error();
    
    lLoadingImage.className = 'icon loading';/* показываем загрузку*/
    lErrorImage.className   = 'icon error hidden';/* прячем ошибку */            
    
    
    /* show loading icon * 
     * if it not showed  */
    var lCurrent = lCurrent.firstChild.nextSibling;
    if(lCurrent !== lLoadingImage.parentElement)
        lCurrent.appendChild(lLoadingImage);
        
    this.loading = true;
    var lParent = this;
    /* reading data from current file */
    $.ajax({
        url:lA,
         error: function(jqXHR, textStatus, errorThrown){
            lErrorImage.className   = 'icon error';
            lErrorImage.title       = jqXHR.responseText;
            
            lCurrent.firstChild.nextSibling.appendChild(lErrorImage);
            
            lLoadingImage.className = 'hidden';
            
            console.log(jqXHR.responseText);
            
            lParent.loading         = false;
         },
         
         success:function(data, textStatus, jqXHR){                    
            /* if we got json - show it */
            if(typeof data === 'object')
                data = JSON.stringify(data, null, 4);
            
            initCodeMirror_f(data);
            
            /* removing keyBinding if set */
            CloudCommander.keyBinded    = false;
            
            lLeft   &&
                (lLeft.className        = 'panel hidden');
            
            lLoadingImage.className     = 'hidden';
            
            lParent.loading             = false;
        }
    });            
});

/* function hides CodeMirror editor */
CloudCommander.Editor.CodeMirror.hide =  (function(pParent) {
    return function(){
        CloudCommander.keyBinded = true;
        
        var lLeft           = pParent.getById('left');
        var lCloudEditor    = pParent.getById('CloudEditor');
        
        /*
        lCloudEditor &&
            (lCloudEditor.className  = 'hidden');
        */
        lLeft       &&
            (lLeft.className         = 'panel');
            
        var lCodeMirror = pParent.getByClass('CodeMirror');
        if(lCodeMirror.length)
            lCloudEditor
                .removeChild(lCodeMirror[0]);
    };
});

CloudCommander.Editor.Keys = (function(){
    "use strict";
          
    /* loading js and css of CodeMirror */
    this.CodeMirror.show(this.CodeMirror);
    
    var key_event=function(event){

        /* если клавиши можно обрабатывать */
        if(CloudCommander.keyBinded){
            /* if f4 pressed */
            if(event.keyCode===115){
                CloudCommander.Editor.CodeMirror.show();
            }
        }
    };
       
    /* добавляем обработчик клавишь */
    if (document.addEventListener)                
        document.addEventListener('keydown', key_event,false);
        
    else        
        document.onkeypress=key_event;
});
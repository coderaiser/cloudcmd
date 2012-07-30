var CloudCommander, CodeMirror;
/* object contains editors CodeMirror
 * and later will be Ace
 */
CloudCommander.Editor = {};
CloudCommander.Editor.CodeMirror = {    
    load: (function(){ /* function loads CodeMirror js and css files */
    
        /* function shows editor */
        var showEditor = function (pParent){
            return function(){
                if (!document.getElementById('CloudEditor')) {
                    var lEditor=document.createElement('div'); 
                    lEditor.id ='CloudEditor';
                    var lFM = document.getElementById('fm');
                    
                    if(lFM){
                      lFM.appendChild(lEditor);
                    
                        CodeMirror(lEditor,{
                            mode        : "xml",  
                            htmlMode    : true,
                            theme       : 'night',
                            lineNumbers : true,
                            //переносим длинные строки
                            lineWrapping: true,
                            extraKeys: {
                              //Сохранение
                              "Esc": pParent.hide(pParent)
                            }
                        });
                    }else console.log('Error. Something went wrong FM not found');
                }
            };
        };
        /* function loads css files
         * of CodeMirror
         */
        var loadAll = function(pParent) {
            return function(){
                CloudCommander.cssLoad({
                    src     : 'lib/client/editor/codemirror/pack/codemirror.pack.css'
                });
              
                CloudCommander.cssLoad({
                    src     : 'lib/client/editor/codemirror/pack/night.pack.css'
                });
              
                CloudCommander.cssSet({id:'editor',
                    inner : '.CodeMirror{'                          +
                                'font-family:\'Droid Sans Mono\';'  +
                                'font-size:15px;'                   +
                                'resize:vertical;'                  +
                                'padding:20px;'                     +
                            '}'                                     +
                            '.CodeMirror-scroll{'                   +
                                'height: 660px;'                    +
                            '}'                                     +                           
                            '.CodeMirror-scrollbar{'                +
                                 'overflow-y:auto'                  +
                            '}'
                });  
                          
                CloudCommander.jsload('lib/client/editor/codemirror/pack/xml.pack.js',
                    showEditor(pParent));
            };
        };
        
        /* load CodeMirror main module */
        CloudCommander.jsload('lib/client/editor/codemirror/pack/codemirror.pack.js', loadAll(this));
    }),
    
    show : (function(){ /* function shows CodeMirror editor */
            /* if CloudEditor is not loaded - loading him */
            document.getElementById('CloudEditor') ||
                this.load();
              /* removing keyBinding if set */
            CloudCommander.keyBinded = false;
            
            var lLeft           = this.getById('left');
            var lCloudEditor    = this.getById('CloudEditor');
            
            lLeft           &&
                (lLeft.className = 'panel hidden');
                
            lCloudEditor    &&
                (lCloudEditor.className  = '');
        }),                                
    hide :  (function(pParent) {
                return function(){
                    CloudCommander.keyBinded = true;
                    
                    var lLeft           = pParent.getById('left');
                    var lCloudEditor    = pParent.getById('CloudEditor');
                    
                    lCloudEditor &&
                        (lCloudEditor.className  = 'hidden');
                    
                    lLeft       &&
                        (lLeft.className         = 'panel');
                };
            }),
    getById: function(pId){return document.getElementById(pId);},
    
    getPanel: function(){
        var lCurrent = document.getElementsByClassName('current-file');
        lCurrent.length &&
            (lCurrent = lCurrent[0].parentElement);
        
        return lCurrent && lCurrent.id;
    }
};
CloudCommander.Editor.Keys = (function(){
    "use strict";
    
    /* loading js and css of CodeMirror */
    CloudCommander.Editor.CodeMirror.load();
    
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
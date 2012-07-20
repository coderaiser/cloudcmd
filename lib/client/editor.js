var CloudCommander, CodeMirror;
CloudCommander.Editor = {};
CloudCommander.Editor.CodeMirror = {
    load: (function(){
  
        CloudCommander.jsload('http://codemirror.net/lib/codemirror.js', load_all(this));
        
        function load_all(pParent) {
            return function(){
                CloudCommander.cssLoad({
                    src     : 'http://codemirror.net/lib/codemirror.css',
                    element : document.head
                });
              
                CloudCommander.cssLoad({
                    src     : 'http://codemirror.net/theme/night.css',
                    element : document.head
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
                          
                var lShowEditor_f = function (){
                    if (!document.getElementById('CloudEditor')) {
                        var lEditor=document.createElement('div'); 
                        lEditor.id ='CloudEditor';
                        lEditor.className = 'hidden';
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
                CloudCommander.jsload('http://codemirror.net/mode/xml/xml.js', lShowEditor_f);
            };
        }
    }),
    show : (function(){
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
    
    /* клавиши назначены*/
    CloudCommander.keyBinded=true;
});
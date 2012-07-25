var CloudCommander, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
CloudCommander.Viewer = {getByClass  : function(pClass){
        return document.getElementsByClassName(pClass);
    }};
CloudCommander.Viewer.FancyBox = {
    load: function(){
         
        var lInit_f = (function(pParent){
            return function(){
                $(".fancybox").fancybox({
                    openEffect    : 'none',
                    closeEffect    : 'none',
                    overlay : {
                        opacity: 0.1,
                        css : {
                            'background-color' : '#fff'
                        }
                    }
                });
                
                pParent.set();
            };
        });
        
        CloudCommander.cssLoad({
                src : 'http://fancyapps.com/fancybox/source/jquery.fancybox.css'
        });
                
        CloudCommander.jsload(
            'http://fancyapps.com/fancybox/source/jquery.fancybox.pack.js',
            lInit_f(this));
                
    },
    set: function(){
        if(this.getByClass('fancybox').length)
            return;
        try{
            /* get current panel (left or right) */
            var lPanel = this.getByClass('current-file');

            lPanel.length &&
                (lPanel = lPanel[0].parentElement);
                
            /* get all file links */
            var lA = lPanel.getElementsByTagName('a');
            
            var lName;
            for (var i=0; i < lA.length; i++) {
                lName = lA[i].title || lA[i].textContent;
                
                CloudFunc.checkExtension(lName,['png','jpg']) && 
                    (lA[i].className    = 'fancybox') &&
                    (lA[i].rel          = 'gallery');
            }
        }catch(pError){
            console.log(pError);
        }
    },
    getById     : function(pId){return document.getElementById(pId);},
    getByClass  : function(pClass){
        return document.getElementsByClassName(pClass);
    }
};
CloudCommander.Viewer.Keys = (function(){
    "use strict";
    
    CloudCommander.Viewer.FancyBox.load();
    
    var key_event = function(pParent){
        return function(event){
            /* если клавиши можно обрабатывать */
            if(CloudCommander.keyBinded){
                /* if f4 pressed */
                if(event.keyCode===114){
                    CloudCommander.Viewer.FancyBox.set();
                    var lCurrent = pParent.getByClass('current-file');
                          lCurrent.length &&
                            (lCurrent = lCurrent[0]);
                    
                    var lA = lCurrent.getElementsByClassName('fancybox');
                    
                    lA.length &&
                    $.fancybox.open({ href : lA[0].href },
                    { padding : 0 } );
                
                event.preventDefault();
                }
            }
        };
    };
       
    /* добавляем обработчик клавишь */
    if (document.addEventListener)                
        document.addEventListener('keydown', key_event(this),false);
        
    else        
        document.onkeypress=key_event;
    
    /* клавиши назначены*/
    CloudCommander.keyBinded=true;
});
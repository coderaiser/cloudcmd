var CloudCommander, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
CloudCommander.Viewer = {    
    dir             : './lib/client/viewer/'
};

CloudCommander.Viewer.FancyBox              = new CloudCommander.Util();

CloudCommander.Viewer.FancyBox.dir          = CloudCommander.Viewer.dir + 
    'fancybox/';
    
/* function return configureation
 * for FancyBox open and
 * onclick (it shoud be
 * different objects)
 */
CloudCommander.Viewer.FancyBox.getConfig    = (function(){
    return{
        beforeShow : (function(){
        CloudCommander.keyBinded = false;
        }),
        beforeClose: (function(){
            CloudCommander.keyBinded = true;
        }),
        
        openEffect    : 'none',
        closeEffect	: 'none',
        
        helpers : {
            overlay : {
                opacity: 0.1,
                css : {
                    'background-color' : '#fff'
                }
            }
        },
        padding : 0
    };
});

/* function loads css and js of FancyBox
 * @pParent     - this
 * @pCallBack   -  executes, when everything loaded
 */
CloudCommander.Viewer.FancyBox.load         = (function(pParent, pCallBack){
    return function(){
        var ljsLoad_f = function(){                                
            var lSrc = pParent.dir + 'jquery.fancybox.pack.js';
            pParent.jsload(lSrc,{
                    onload: pCallBack
            });
        };
        
        var lSrc = pParent.dir +'jquery.fancybox.pack.css';
        pParent.cssLoad({
            src  : lSrc,
            func : {
                onload: ljsLoad_f            
            }   
        });
    }();
});

CloudCommander.Viewer.FancyBox.set          = (function(){
    if(this.getByClass('fancybox').length)
        return;
    try{
        /* get current panel (left or right) */
        var lPanel = this.getPanel();
            
        /* get all file links */
        var lA = lPanel.getElementsByTagName('a');
        
        var lName;
        /* first two is not files nor folders*/
        for (var i=2; i < lA.length; i++) {
            lName = lA[i].title || lA[i].textContent;
            
            CloudFunc.checkExtension(lName,
                ['png','jpg', 'gif','ico']) && 
                    (lA[i].className    = 'fancybox') &&
                    (lA[i].rel          = 'gallery');
        }
        
        /* $('.fancybox').fancybox(this.getConfig()); */
        /*            
            $('.fancybox').dblclick( function(){
                var lConfig = lThis.getConfig();
                lConfig.href = this.href;
                $.fancybox(lConfig)            
            });
            $(Images[i]).data("events").dblclick[0].handler    
        */
        var lImages = $('.fancybox');
        var lThis = this;
        
        var lDblClick_f = function(pHref){
            return function(){
                var lConfig  = lThis.getConfig();
                lConfig.href = pHref;
                
                $.fancybox(lConfig);
            }
        }
        
        for(var i=0; i < lImages.length; i++)
            lImages[i].ondblclick = lDblClick_f(lImages[i].href);
    }catch(pError){
        console.log(pError);
    }
});
    
CloudCommander.Viewer.FancyBox.show         = (function(pParent){
    CloudCommander.Viewer.FancyBox.set();
    
    var lCurrent = this.getCurrentFile();    
    var lA = lCurrent.getElementsByClassName('fancybox');                        
    var lConfig = this.getConfig();
    
    lA.length &&
        $.fancybox.open({ href : lA[0].href },
            lConfig);
});

CloudCommander.Viewer.Keys                  = (function(){
    "use strict";
            
    var lCallBack_f = (function(){
        var key_event = (function(){
            return function(event){
                /* если клавиши можно обрабатывать */
                if(CloudCommander.keyBinded)
                    /* if f3 pressed */
                    if(event.keyCode===114){
                        CloudCommander.Viewer.FancyBox.show();
                    
                    event.preventDefault();                    
                    }                
            };
        });
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event(),false);
            
        else        
            document.onkeypress=key_event;
        
        /* showing images  preview*/
        CloudCommander.Viewer.FancyBox.show();
    });
        
    CloudCommander.Viewer.FancyBox.load(this.FancyBox, lCallBack_f);
});
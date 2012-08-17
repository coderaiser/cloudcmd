var CloudCommander, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
CloudCommander.Viewer                       = {
    get: (function(){
        return this.FancyBox;
    })
};

CloudCommander.Viewer.FancyBox              = new CloudCommander.Util();

CloudCommander.Viewer.dir                   = './lib/client/viewer/';
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
        var lA = this.getByTag('a', lPanel);
        
        var lThis = this;
        
        var lDblClick_f = function(pHref, pIsImg){
            return function(){
                var lConfig  = lThis.getConfig();
                lConfig.href = pHref;
                if(pIsImg)
                    $.fancybox(lConfig);
            };
        };
        
        /* first two is not files nor folders*/
        for (var i=2; i < lA.length; i++) {
            var lIsImg_b = false;
            var lName = lA[i].title || lA[i].textContent;
            
            lA[i].className    = 'fancybox';
            if(CloudFunc.checkExtension(lName, ['png','jpg', 'gif','ico'])){                
                lA[i].rel          = 'gallery';
                var lIsImg_b = true;
            }
            
            lA[i].ondblclick = lDblClick_f(lA[i].href, lIsImg_b);
        }
                                
    }catch(pError){
        console.log(pError);
    }
});
    

CloudCommander.Viewer.show                  = 
CloudCommander.Viewer.FancyBox.show         = (function(pParent){
    CloudCommander.Viewer.FancyBox.set();
    
    var lCurrent = this.getCurrentFile();    
    var lA = this.getByClass('fancybox', lCurrent);                        
    var lConfig = this.getConfig();
    
    lA.length &&
        $.fancybox.open({ href : lA[0].href },
            lConfig);
});

CloudCommander.Viewer.Keys                  = (function(){
    "use strict";
            
    var lCallBack_f = (function(){
        var key_event = (function(pEvent){
            /* если клавиши можно обрабатывать */
            if(CloudCommander.keyBinded)
                /* if f3 pressed */
                if(pEvent.keyCode === CloudCommander.KEY.F3){
                    CloudCommander.Viewer.FancyBox.show();
                
                    pEvent.preventDefault();
                }
        });
           
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
        
        /* showing images  preview*/
        CloudCommander.Viewer.FancyBox.show();
    });
        
    CloudCommander.Viewer.FancyBox.load(this.FancyBox, lCallBack_f);
});
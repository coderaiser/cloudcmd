var CloudCommander, Util, DOM, $, filepicker;
/* module for work with filepicker */

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var FilePicker = function(){
        this.init            = function(pCallBack){
            Util.loadOnLoad([
                Util.retExec(pCallBack),
                load
            ]);
        };
        
        
        this.uploadFile     = function(pParams, pCallBack){
            var lContent    = pParams.data,
                lName       = pParams.name;
                
            filepicker.store(lContent, {filename: lName}, function(new_fpfile){
                console.log(new_fpfile);
            });
            
            filepicker.pick(function(FPFile){
                console.log(FPFile.url);
                
                Util.exec(pCallBack);
            });
        };
        
        this.saveFile   = function(pCallBack){
            filepicker.pick(function(FPFile){
                console.log(FPFile);
                
                DOM.ajax({
                    url     : FPFile.url,
                    success : function(pData){
                        Util.exec(pCallBack, FPFile.filename, pData);
                    }
                });
            });
        };
        
        function load(pCallBack){
            console.time('filepicker load');
            var lHTTP = "https:"===document.location.protocol? "https:" : "http:";
            
            DOM.jsload(lHTTP + '//api.filepicker.io/v1/filepicker.js', function(){
                filepicker.setKey('AACq5fTfzRY2E_Rw_4kyaz');
                DOM.Images.hideLoad();
                console.timeEnd('filepicker loaded');
                Util.exec(pCallBack);
            });
        }
    };
    
    CloudCmd.FilePicker = new FilePicker();
})(CloudCommander, Util, DOM);

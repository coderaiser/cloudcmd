var CloudCmd, Util, DOM, $, filepicker;

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
                
            filepicker.store(lContent, {filename: lName}, function(pFPFile){
                console.log(pFPFile);
                
                filepicker.exportFile(pFPFile, Util.log, Util.log);
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
            var lHTTP = document.location.protocol;
            
            DOM.jsload(lHTTP + '//api.filepicker.io/v1/filepicker.js', function(){
                CloudCmd.getModules(function(pModules){
                    var lStorage    = Util.findObjByNameInArr(pModules, 'storage'),
                        lFilePicker = Util.findObjByNameInArr(lStorage, 'FilePicker'),
                        lKey        = lFilePicker && lFilePicker.key;
                        
                        filepicker.setKey(lKey);
                        DOM.Images.hideLoad();
                        console.timeEnd('filepicker loaded');
                        Util.exec(pCallBack);
                    });
                });
        }
    };
    
    CloudCmd.FilePicker = new FilePicker();
})(CloudCmd, Util, DOM);

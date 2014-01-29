var CloudCmd, Util, DOM, $, filepicker;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    var FilePicker = function(pCallBack) {
        function init(pCallBack) {
            Util.loadOnLoad([
                load,
                Util.retExec(pCallBack),
            ]);
        }
        
        
        this.uploadFile     = function(pParams, pCallBack) {
            var lContent    = pParams.data,
                lName       = pParams.name;
                
            filepicker.store(lContent, {
                    mimetype: '',
                    filename: lName
                },
                function(pFPFile) {
                    Util.log(pFPFile);
                    
                    filepicker.exportFile(pFPFile, Util.log, Util.log);
            });
        };
        
        this.saveFile   = function(pCallBack) {
            filepicker.pick(function(FPFile) {
                Util.log(FPFile);
                
                DOM.ajax({
                    url             : FPFile.url,
                    responseType    :'arraybuffer',
                    success         : function(pData) {
                        Util.exec(pCallBack, FPFile.filename, pData);
                    }
                });
            });
        };
        
        function load(pCallBack) {
            Util.time('filepicker load');
            var lHTTP = document.location.protocol;
            
            DOM.jsload(lHTTP + '//api.filepicker.io/v1/filepicker.js', function() {
                CloudCmd.getModules(function(pModules) {
                    var lStorage    = Util.findObjByNameInArr(pModules, 'storage'),
                        lFilePicker = Util.findObjByNameInArr(lStorage, 'FilePicker'),
                        lKey        = lFilePicker && lFilePicker.key;
                        
                        filepicker.setKey(lKey);
                        DOM.Images.hideLoad();
                        Util.timeEnd('filepicker loaded');
                        Util.exec(pCallBack);
                    });
                });
        }
        
        init(pCallBack);
    };
    
    CloudCmd.FilePicker = new FilePicker();
})(CloudCmd, Util, DOM);

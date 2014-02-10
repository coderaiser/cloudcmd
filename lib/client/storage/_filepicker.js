var CloudCmd, Util, DOM, filepicker;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.FilePicker = FilePickerProto;
    
    function FilePickerProto(pCallBack) {
        
        function init(pCallBack) {
            Util.loadOnLoad([
                load,
                Util.retExec(pCallBack),
            ]);
        }
        
        
        this.uploadFile     = function(params) {
            var content = params.data,
                name    = params.name,
                log     = Util.log.bind(Util);
                
            filepicker.store(content, {
                    mimetype: '',
                    filename: name
                },
                function(fpFile) {
                    log(fpFile);
                    
                    filepicker.exportFile(fpFile, log, log);
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
    }
})(CloudCmd, Util, DOM);

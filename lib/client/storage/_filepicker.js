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
        
        function load(callback) {
            Util.time('filepicker load');
            
            DOM.jsload('//api.filepicker.io/v1/filepicker.js', function() {
                CloudCmd.getModules(function(modules) {
                    var storage = Util.findObjByNameInArr(modules, 'storage'),
                        picker  = Util.findObjByNameInArr(storage, 'FilePicker'),
                        key     = picker && picker.key;
                        
                        filepicker.setKey(key);
                        
                        DOM.Images.hideLoad();
                        Util.timeEnd('filepicker loaded');
                        Util.exec(callback);
                    });
                });
        }
        
        init(pCallBack);
    }
})(CloudCmd, Util, DOM);

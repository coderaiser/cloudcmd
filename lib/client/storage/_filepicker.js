var CloudCmd, Util, DOM, filepicker;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.FilePicker = FilePickerProto;
    
    function FilePickerProto(callback) {
        
        function init(callback) {
            Util.loadOnLoad([
                load,
                callback,
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
        
        this.saveFile   = function(callback) {
            filepicker.pick(function(fpFile) {
                Util.log(fpFile);
                
                DOM.ajax({
                    url             : fpFile.url,
                    responseType    :'arraybuffer',
                    success         : function(data) {
                        Util.exec(callback, fpFile.filename, data);
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
                        
                        DOM.Images.hide();
                        Util.timeEnd('filepicker loaded');
                        Util.exec(callback);
                    });
                });
        }
        
        init(callback);
    }
})(CloudCmd, Util, DOM);

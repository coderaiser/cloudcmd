/* global CloudCmd, Util, DOM, filepicker */

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Cloud = CloudProto;
    
    function CloudProto(callback) {
        function init(callback) {
            Util.exec.series([
                load,
                callback,
            ]);
        }
        
        this.uploadFile     = function(name, data) {
            var log = CloudCmd.log;
            
            filepicker.store(data, {
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
                console.log(fpFile);
                
                DOM.load.ajax({
                    url             : fpFile.url,
                    responseType    : 'arraybuffer',
                    success         : function(data) {
                        Util.exec(callback, fpFile.filename, data);
                    }
                });
            });
        };
        
        function load(callback) {
            Util.time('filepicker load');
            
            DOM.load.js('//api.filepicker.io/v1/filepicker.js', function() {
                DOM.Files.get('modules', function(error, modules) {
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

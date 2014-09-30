var CloudCmd, Util, DOM;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Upload = UploadProto;
        
    function UploadProto() {
        var Images      = DOM.Images,
            RESTful     = DOM.RESTful,
            Files       = DOM.Files,
            
            Upload      = this;
        
        function init() {
            Images.showLoad({
                top: true
            });
            
            Util.exec.series([
                CloudCmd.View,
                Upload.show
            ]);
        }
        
        this.show                       = function() {
            Images.showLoad({
                top: true
            });
            
            Files.get('upload', function(error, data) {
                CloudCmd.View.show(data, {
                    autoSize    : true,
                    afterShow   : afterShow
                });
            });
            
            DOM.load.style({
                id      : 'js-upload',
                inner   : '[data-name=js-upload-file-button] {'                                         +
                              'font-family: "Droid Sans Mono", "Ubuntu Mono", "Consolas", monospace;'   +
                                  'font-size: 20px;'                                                    +
                        '}'
            });
            
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        function afterShow() {
            var button = DOM.getByDataName('js-upload-file-button');
            
            Images.hide();
            
            DOM.Events.add('change', button, uploadFiles);
        }
        
        function uploadFiles(event) {
            var path,
                func    = CloudCmd.refresh,
                dir     = DOM.CurrentInfo.dirPath,
                files   = event.target.files,
                n       = files.length;
            
            Upload.hide();
            
            if (n)
                Util.forEach(files, function(file) {
                    var name    = file.name;
                        path    = dir + name;
                    
                    Images.showLoad({top: true});
                    Images.setProgress(0, name);
                     
                    RESTful.write(path, file, func);
                });
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM);

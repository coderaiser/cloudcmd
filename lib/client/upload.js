var CloudCmd, Util, DOM;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Upload = UploadProto;
        
    function UploadProto() {
        var Images      = DOM.Images,
            Files       = DOM.Files,
            
            Upload      = this;
        
        function init() {
            Images.show.load('top');
            
            Util.exec.series([
                CloudCmd.View,
                Upload.show
            ]);
        }
        
        this.show                       = function() {
            Images.show.load('top');
            
            Files.get('upload', function(error, data) {
                CloudCmd.View.show(data, {
                    autoSize    : true,
                    afterShow   : afterShow
                });
            });
            
            DOM.load.style({
                id      : 'upload-css',
                inner   : '[data-name=js-upload-file-button] {'                                         +
                              'font-family: "Droid Sans Mono", "Ubuntu Mono", "Consolas", monospace;'   +
                              'font-size: 20px;'                                                        +
                              'width: 97%'                                                              +
                        '}'
            });
            
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        function afterShow() {
            var button = DOM.getByDataName('js-upload-file-button');
            
            Images.hide();
            
            DOM.Events.add('change', button, function(event) {
                var files = event.target.files;
                
                Upload.hide();
                
                DOM.uploadFiles(files);
            });
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM);

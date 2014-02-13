var CloudCmd, Util, DOM, gapi;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var GDrive      = {};
    
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * load google api library
     */
    function load(pCallBack){
        /* https://code.google.com/p/google-api-javascript-client/ */
        var lUrl = 'https://apis.google.com/js/client.js';
        
        DOM.jsload(lUrl, function(){
            CloudCmd.getModules(function(pModules){
                var lStorage    = Util.findObjByNameInArr(pModules, 'storage'),
                lGDrive         = Util.findObjByNameInArr(lStorage, 'GDrive'),
                GDriveId        = lGDrive && lGDrive.id;
                /* https://developers.google.com/drive/credentials */
                
                var lCLIENT_ID  = GDriveId + '.apps.googleusercontent.com',
                    lSCOPES     = 'https://www.googleapis.com/auth/drive',
                    
                    lParams     = {
                        'client_id' : lCLIENT_ID,
                        'scope'     : lSCOPES,
                        'immediate' : false
                    };
                
                setTimeout(function() {
                    gapi.auth.authorize(lParams, function(pAuthResult){
                        
                        if (pAuthResult && !pAuthResult.error)
                            gapi.client.load('drive', 'v2', function() {
                                Util.exec(pCallBack);
                            });
                        });
                        
                }, 1500);
            });
        });
    }
    
    
    /**
     * Insert new file.
     *
     * @param {File} fileData {name, data} File object to read data from.
     * @param {Function} callback Function to call when the request is complete.
     */
    GDrive.uploadFile = function(pParams, pCallBack) {
        var lContent       = pParams.data,
            lName       = pParams.name,
            boundary    = '-------314159265358979323846',
            delimiter   = "\r\n--" + boundary + "\r\n",
            close_delim = "\r\n--" + boundary + "--",
            
            contentType = pParams.type || 'application/octet-stream',
            metadata    = {
                'title'     : lName,
                'mimeType'  : contentType
            },
            
            base64Data = btoa(lContent),
            
            multipartRequestBody =
                delimiter                                   +
                'Content-Type: application/json\r\n\r\n'    +
                JSON.stringify(metadata)                    +
                delimiter                                   +
                'Content-Type: ' + contentType + '\r\n'     +
                'Content-Transfer-Encoding: base64\r\n'     +
                '\r\n'                                      +
                base64Data                                  +
                close_delim;
            
            var request = gapi.client.request({
                'path': '/upload/drive/v2/files',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
            
            'body': multipartRequestBody
        });
        
        if (!pCallBack)
            pCallBack = function(file) {
                Util.log(file);
            };
            
        request.execute(pCallBack);
    };
    
    
    GDrive.init                = function(pCallBack){
        Util.loadOnLoad([
            load,
            Util.retExec(pCallBack)
        ]);
    };
    
    CloudCmd.GDrive    = GDrive;
})(CloudCmd, Util, DOM);
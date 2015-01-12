var CloudCmd, Util, DOM, gapi;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var GDrive      = {};
    
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * load google api library
     */
    function load(callback){
        /* https://code.google.com/p/google-api-javascript-client/ */
        var lUrl = 'https://apis.google.com/js/client.js';
        
        DOM.load.js(lUrl, function() {
            DOM.Files.get('modules', function(error, modules) {
                var storage     = Util.findObjByNameInArr(modules, 'storage'),
                    gDrive      = Util.findObjByNameInArr(storage, 'GDrive'),
                    gDriveId    = gDrive && gDrive.id,
                /* https://developers.google.com/drive/credentials */
                    
                    clientId    = gDriveId + '.apps.googleusercontent.com',
                    scopes      = 'https://www.googleapis.com/auth/drive',
                    
                    lParams     = {
                        'client_id' : clientId,
                        'scope'     : scopes,
                        'immediate' : false
                    };
                
                setTimeout(function() {
                    gapi.auth.authorize(lParams, function(pAuthResult){
                        
                        if (pAuthResult && !pAuthResult.error)
                            gapi.client.load('drive', 'v2', Util.exec.ret(callback));
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
            delimiter   = '\r\n--' + boundary + '\r\n',
            close_delim = '\r\n--' + boundary + '--',
            
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
                console.log(file);
            };
            
        request.execute(pCallBack);
    };
    
    
    GDrive.init                = function(callback) {
        Util.exec.series([
            load,
            Util.exec.ret(callback)
        ]);
    };
    
    CloudCmd.GDrive    = GDrive;
})(CloudCmd, Util, DOM);
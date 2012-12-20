var CloudCommander, Util, DOM, gapi;

(function(){
    "use strict";
    
    var cloudcmd    = CloudCommander,
        GDrive      = {};
        
    
    function authorize(pData){
        /* https://developers.google.com/drive/credentials */
        var lCLIENT_ID  = '255175681917.apps.googleusercontent.com',
            lSCOPES     = 'https://www.googleapis.com/auth/drive',
            lParams     = {
                'client_id' : lCLIENT_ID,
                'scope'     : lSCOPES,
                'immediate' : false
            };
        
        setTimeout(function() {
            gapi.auth.authorize(lParams, function(pAuthResult){
            if (pAuthResult && !pAuthResult.error)
                uploadFile(pData);
        });
        }, 500);
    }
    
    function load(pData){
        var lUrl = 'https://apis.google.com/js/client.js';
        
        DOM.jsload(lUrl, function(){
            authorize(pData);
        });
    }
    
      /**
       * Start the file upload.
       *
       * @param {Object} evt Arguments from the file selector.
       */
      function uploadFile(pData) {
        gapi.client.load('drive', 'v2', function() {
            GDrive.uploadFile(pData);
        });
      }
    
    /**
     * Insert new file.
     *
     * @param {File} fileData {name, data} File object to read data from.
     * @param {Function} callback Function to call when the request is complete.
     */
    GDrive.uploadFile = function(pData, callback) {
        var lData       = pData.data,
            lName       = pData.name,
            boundary    = '-------314159265358979323846',
            delimiter   = "\r\n--" + boundary + "\r\n",
            close_delim = "\r\n--" + boundary + "--",
            
            contentType = pData.type || 'application/octet-stream',
            metadata    = {
                'title'     : lName,
                'mimeType'  : contentType
            },
            
            base64Data = btoa(lData),
            
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
        
        if (!callback)
            callback = function(file) {
                console.log(file);
            };
            
        request.execute(callback);
    };
    
    
    GDrive.init                = function(pData){
        load(pData);
    };
    
    cloudcmd.GDrive    = GDrive;
})();
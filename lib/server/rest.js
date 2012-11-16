/* RESTfull module */

(function(){
    "use strict";
    
    var DIR         = process.cwd() + '/',
        main        = require(DIR + 'lib/server/main'),
        Util        = main.util,
        APIURL      = '/api/v1',
        OK          = 200,
        Header      = main.generateHeaders('api.json', false);
        
    /**
     * rest interface
     * @pConnectionData {request, responce}
     */
    exports.api = function(pConnectionData){
        var lRet    = false,
            lReq    = pConnectionData.request,
            lRes    = pConnectionData.response,
            lUrl    = lReq.url,
            lMethod = lReq.method;
        
        if( Util.isContainStr(lUrl, APIURL) ){
            var lCommand = Util.removeStr(lUrl, APIURL),
                lData = getData(lMethod, lCommand);
            
            send(lRes, lData);
            
            lRet = true;
        }
        
        return lRet;
    };
    
    
    /**
     * send data
     * 
     * @param pRes
     * @param pData
     */
    function send(pRes, pData){
        pRes.writeHead(OK, Header);
        pRes.end( pData.toString() );
    }
    
    /**
     * getting data on method and command
     * 
     * @param pMethod
     * @param pCommand
     */
    function getData(pMethod, pCommand){
        var lResult;
        
        switch(pMethod){
            case 'GET':
                lResult = onGET(pCommand);
                break;
                
            case 'PUT':
                lResult = onPUT(pCommand);
                break;
            }
        
        return lResult;
    }
    
    /**
     * process data on GET request
     * 
     * @param pCommand
     */
    function onGET(pCommand){
        var lResult;
        
        switch(pCommand){
            case '':
                lResult = {info: 'Cloud Commander API v1'};
                break;
        }
        
        return lResult;
    }
    
    /**
     * process data on PUT request
     * 
     * @param pCommand
     */
    function onPUT(pCommand){
        var lResult;
        
        switch(pCommand){
        }
        
        return lResult;
    }
    
})();

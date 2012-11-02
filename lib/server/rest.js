/* RESTfull module */

var APIURL;

exports.rest = function(req){
        var lUrl    = req.url,
            lMethod = req.method;
        
        /* if lUrl contains api url */
        if( lUrl.indexOf(APIURL) === 0 ){
            lUrl = lUrl.replace(APIURL, '');
            
            console.log(req.url);
            console.log(req.method);
        }
}
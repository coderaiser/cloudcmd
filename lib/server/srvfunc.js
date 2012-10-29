"strict mode";
/**
 * function do save exec
 */
exports.exec = function(pCallBackk){
    if( typeof pCallBackk === 'function')
        pCallBackk();
    else console.log('error in ' + pCallBackk);
};

/**
 * function do safe require of needed module
 * @param pModule
 */
exports.require = function(pSrc){
    var lModule,
    
    lError = exports.tryCatch(function(){
        lModule = require(pSrc);
    });
    
    if(lError)
        console.log(lError);
    
    return lModule;
};

/**
 * function execute param function in
 * try...catch block
 * 
 * @param pCallBack
 */
exports.tryCatch = function(pCallBack){
    var lRet;
    try{
        pCallBack();        
    }
    catch(pError){lRet = pError;}
    
    return lRet;
};
(function(){
    "strict mode";
    
    var DIR         = process.cwd() + '/',
        LIBDIR      = DIR + 'lib/',
        SRVDIR      = LIBDIR + 'server/',
        Util        = require(LIBDIR + 'util');
    
    /**
     * function do safe require of needed module
     * @param pModule
     */
    exports.require = function srvrequire(pSrc){
        var lModule,
        
        lError = Util.tryCatch(function(){
            lModule = require(pSrc);
        });
        
        if(lError)
            console.log(lError);
        
        return lModule;
    };
    
    exports.isWin32 = process.platform === 'win32';
}());
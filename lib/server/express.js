(function() {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# express.js'                                     + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# easy to use web server.'                        + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
             
    var main                = global.cloudcmd.main,
        express             = main.require('express'),
        app                 = express && express();
    
    exports.getApp          = function(controller) {
        if (app)
            app.use(express.logger('dev'))
               .all('*', controller);
        
        return app;
    };
})();

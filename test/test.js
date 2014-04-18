(function() {
    'use strict';
    
    var DIR                 = process.cwd() + '/',
        main                = require(DIR + 'lib/server/main'),
        
        Util                = main.util,
        
        CloudFunc           = main.cloudfunc,
        HTMLDIR             = main.HTMLDIR,
        files               = main.files,
        
        FS_DIR              = HTMLDIR   + 'fs/',
        TEMPLATEPATH        = FS_DIR    + 'file.html',
        LINK_TEMPLATE_PATH  = FS_DIR    + 'link.html',
        PATHTEMPLATE_PATH   = FS_DIR    + 'path.html',
        EXPECT_PATH         = DIR       + 'test/expect.html',
        
        Files               = [TEMPLATEPATH, PATHTEMPLATE_PATH, LINK_TEMPLATE_PATH, EXPECT_PATH],
        
        JSON_FILES          = {
            path  : "/etc/X11/", 
            files : [{
                name: "applnk",
                size: "dir",
                uid : 0,
                mode: "40755"
            }, {
                name: "prefdm",
                size: 1328,
                uid : 0,
                mode: "100755"
            }]
        },
        
        
        Expect =
            '<div data-name="js-path" class="reduce-text" title="/etc/X11/">'   +
                '<span data-name="js-clear-storage" class="path-icon clear-storage" '                        +
                    'title="clear storage (Ctrl+D)">'                           +
                '</span>'                                                       +
                '<a data-name="js-refresh" href="/fs/etc/X11" '                 +
                'class="path-icon refresh-icon" title="refresh (Ctrl+R)"></a>'  +
                '<span data-name="js-links" class=links>'                       +
                    '<a href="/fs" title="/">/</a>'                             +
                    '<a href="/fs/etc" title="/etc">'                           +
                        'etc'                                                   +
                    '</a>/X11/'                                                 +
                '</span>'                                                       +
            '</div>';
    
    
    exports.check = function() {
        files.read(Files, 'utf-8', function(errors, files) {
            var i, n, template, pathTemplate, linkTemplate, expect, result;
            
            if (errors)
                Util.log(errors);
            else {
                Util.time('CloudFunc.buildFromJSON');
                
                template        = files[TEMPLATEPATH];
                pathTemplate    = files[PATHTEMPLATE_PATH];
                linkTemplate    = files[LINK_TEMPLATE_PATH];
                expect          = files[EXPECT_PATH];
                
                result          = CloudFunc.buildFromJSON(JSON_FILES, template, pathTemplate, linkTemplate);
                
                Expect          += expect;
                
                n = Expect.length;
                for (i = 0; i < n; i++)
                    if (result[i] !== Expect[i]) {
                        Util.log('Error in char number: ' + i    + '\n' +
                                    'Expect: ' + Expect.substr(i)  + '\n' +
                                    'Result: ' + result.substr(i) );
                        break;
                    }
                    
                    if (i === n)
                        console.log('CloudFunc.buildFromJSON: OK');   
                
                Util.timeEnd('CloudFunc.buildFromJSON');
            }
        });
    };
})();

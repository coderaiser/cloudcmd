(function() {
    'use strict';
    
    var DIR                 = __dirname + '/../../',
        LIBDIR              = DIR + 'lib/',
        HTMLDIR             = DIR + 'html/',
        
        Util                = require(LIBDIR + 'util'),
        CloudFunc           = require(LIBDIR + 'cloudfunc'),
        files               = require(LIBDIR + 'server/files'),
        
        FS_DIR              = HTMLDIR   + 'fs/',
        TEMPLATEPATH        = FS_DIR    + 'file.html',
        LINK_TEMPLATE_PATH  = FS_DIR    + 'link.html',
        PATHTEMPLATE_PATH   = FS_DIR    + 'path.html',
        PATH_LINK           = FS_DIR    + 'path-link.html',
        EXPECT_PATH         = DIR       + 'test/lib/cloudfunc.html',
        
        Files               = [TEMPLATEPATH, PATHTEMPLATE_PATH, LINK_TEMPLATE_PATH, EXPECT_PATH, PATH_LINK],
        
        JSON_FILES          = {
            path  : '/etc/X11/', 
            files : [{
                name: 'applnk',
                size: 'dir',
                uid : 0,
                mode: '40755'
            }, {
                name: 'prefdm',
                size: 1328,
                uid : 0,
                mode: '100755'
            }]
        },
        
        Expect =
            '<div data-name="js-path" class="reduce-text" title="/etc/X11/">'   +
                '<span data-name="js-clear-storage" class="path-icon clear-storage" '   +
                    'title="clear storage (Ctrl+D)">'                           +
                '</span>'                                                       +
                '<a data-name="js-refresh" href="/fs/etc/X11" '                 +
                'class="path-icon refresh-icon" title="refresh (Ctrl+R)"></a>'  +
                '<span data-name="js-links" class=links>'                       +
                    '<a data-name="js-path-link" href="/fs/" title="/">/</a>'   +
                    '<a data-name="js-path-link" href="/fs/etc/" title="/etc/">'+
                        'etc'                                                   +
                    '</a>/X11/'                                                 +
                '</span>'                                                       +
            '</div>';
    
    exports.check = function() {
        files.read(Files, 'utf-8', function(errors, files) {
            var isNotOk, i, template, pathTemplate, pathLink, linkTemplate, expect, result;
            
            if (errors) {
                throw(console.log(errors));
            } else {
                Util.time('CloudFunc.buildFromJSON');
                
                template        = files[TEMPLATEPATH];
                pathTemplate    = files[PATHTEMPLATE_PATH];
                pathLink        = files[PATH_LINK],
                linkTemplate    = files[LINK_TEMPLATE_PATH];
                expect          = files[EXPECT_PATH];
                
                result          = CloudFunc.buildFromJSON({
                    data: JSON_FILES,
                    template: {
                        file        : template,
                        path        : pathTemplate,
                        pathLink    : pathLink,
                        link        : linkTemplate
                    }
                });
                
                Expect          += expect;
                
                isNotOk = Util.slice(Expect).some(function(item, number) {
                    var ret = result[number] !== item;
                    
                    if (ret)
                        i = number;
                    
                    return ret;
                });
                
                Util.timeEnd('CloudFunc.buildFromJSON');
                
                if (isNotOk) {
                    console.log('Error in char number: ' + i    + '\n' +
                                'Expect: ' + Expect.substr(i)  + '\n' +
                                'Result: ' + result.substr(i) );
                    
                    throw('buildFromJSON: Not OK');
                }
            }
        });
    };
})();

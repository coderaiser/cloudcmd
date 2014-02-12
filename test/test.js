(function(){
    'use strict';
    
    var DIR                 = process.cwd() + '/',
        main                = require(DIR + 'lib/server/main'),
        
        Util                = main.util,
        
        CloudFunc           = main.cloudfunc,
        HTMLDIR             = main.HTMLDIR,
        files               = main.files,
        
        TEMPLATEPATH        = HTMLDIR + 'file.html',
        LINK_TEMPLATE_PATH  = HTMLDIR + 'link.html',
        PATHTEMPLATE_PATH   = HTMLDIR + 'path.html',
        EXPECT_PATH         = DIR + 'test/expect.html',
        
        Files               = [TEMPLATEPATH, PATHTEMPLATE_PATH, LINK_TEMPLATE_PATH, EXPECT_PATH],
        
        JSON_Files = {
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
            '<div class=path title="/etc/X11/">'                                +
                '<span class="path-icon clear-cache" '                          +
                    'id=clear-cache title="clear cache (Ctrl+D)">'              +
                '</span>'                                                       +
                '<span class="path-icon refresh-icon" title="refresh (Ctrl+R)">'+
                    '<a href="/fs/etc/X11"></a></span>'                         +
                '<span class=links>'                                            +
                    '<a href="/fs" title="/">/</a>'                             +
                    '<a href="/fs/etc" title="/etc">'                           +
                        'etc'                                                   +
                    '</a>/X11/'                                                 +
                '</span>'                                                       +
            '</li>'                                                             +
            '<li class=fm-header>'                                              +
                '<span class=mini-icon></span>'                                 +
                '<span class=name>name</span>'                                  +
                '<span class=size>size</span>'                                  +
                '<span class=owner>owner</span>'                                +
                '<span class=mode>mode</span>'                                  +
            '</li>';
    
    
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
                if (result[i] !== Expect[i]){
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

})();

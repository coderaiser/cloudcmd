(function(){
    'use strict';
    
    var DIR                 = process.cwd() + '/',
        main                = require(DIR + 'lib/server/main'),

        Util                = main.util,
        
        CloudFunc           = main.cloudfunc,
        HTMLDIR             = main.HTMLDIR,
        
        TEMPLATEPATH        = HTMLDIR + 'file.html',
        PATHTEMPLATE_PATH   = HTMLDIR + 'path.html',
        EXPECT_PATH         = DIR + 'test/expect.html',
        
        Files               = [TEMPLATEPATH, PATHTEMPLATE_PATH, EXPECT_PATH],
        
        lJSON = [{
            "path": "/etc/X11/",
            "size": "dir"
        }, {
            "name": "applnk",
            "size": "dir",
            "uid": 0,
            "mode": "40755"
        },{
            "name": "prefdm",
            "size": 1328,
            "uid": 0,
            "mode": "100755"
        }],
        
        
        Expect =
            '<li class=path>'                                                   +
                '<span class="path-icon clear-cache" '                          +
                    'id=clear-cache title="clear cache (Ctrl+D)">'              +
                '</span>'                                                       +
                '<span class="path-icon refresh-icon" title="refresh (Ctrl+R)">'+
                    '<a href="/fs/etc/X11"></a></span>'                         +
                '<span>'                                                        +
                    '<a class=links href="/fs" title="/">/</a>'                 +
                    '<a class=links href="/fs/etc" title="/etc">'               +
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
   
    
    main.readFiles(Files, function(pErrors, pFiles){
        if(pErrors)
            Util.log(pErrors);
        else{
            console.time('CloudFunc.buildFromJSON');
            
            var lTemplate       = pFiles[TEMPLATEPATH].toString(),
                lPathTemplate   = pFiles[PATHTEMPLATE_PATH].toString(),
                lExpect         = pFiles[EXPECT_PATH].toString(),
                
                lResult         = CloudFunc.buildFromJSON(lJSON, lTemplate, lPathTemplate);
                
                Expect          += lExpect;
                
                for(var i = 0, n = Expect.length; i < n; i++)
                    if(lResult[i] !== Expect[i]){
                        console.log('Error in char number: ' + i    + '\n' +
                                    'Expect: ' + Expect.substr(i)  + '\n' +
                                    'Result: ' + lResult.substr(i) );
                        break;
                    }
                
                    if(i===n)
                        console.log('CloudFunc.buildFromJSON: OK');    
            
            console.timeEnd('CloudFunc.buildFromJSON');
        }
    });

})();

(function(){
    "use strict";
    
    var DIR             = process.cwd() + '/',
        main            = require(DIR + 'lib/server/main'),
        
        CloudFunc       = main.cloudfunc,
        
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
        }];
   
    start();
    var lResult = CloudFunc.buildFromJSON(lJSON);
    end();
    
    var lExpect =
        '<li class=path>'                                                   +
            '<span class="path-icon clear-cache"'                           +
                'id=clear-cache title="clear cache (Ctrl+D)">'              +
            '</span>'                                                       +
            '<span class="path-icon refresh-icon" title="refresh (Ctrl+R)">'+
                '<a href="/fs/no-js/etc/X11"></a></span>'                   +
            '<span>'                                                        +
                '<a class=links href="/fs/no-js" title="/">/</a>'           +
                '<a class=links href="/fs/no-js/etc" title="/etc">'         +
                    'etc'                                                   +
                '</a>/X11/'                                                 +
            '</span>'                                                       +
        '</li>'                                                             +
            '<li class=fm_header>'                                          +
            '<span class=mini-icon></span>'                                 +
            '<span class=name>name</span>'                                  +
            '<span class=size>size</span>'                                  +
            '<span class=owner>owner</span>'                                +
            '<span class=mode>mode</span>'                                  +
        '</li>'                                                             +
        '<li draggable class=current-file>'                                 +
            '<span class="mini-icon directory"></span>'                     +
            '<span class=name>'                                             +
                '<a href="/fs/no-js/etc" draggable=true>..</a>'             +
            '</span>'                                                       +
            '<span class=size>&lt;dir&gt;</span>'                           +
            '<span class=owner>.</span>'                                    +
            '<span class=mode></span>'                                      +
        '</li>'                                                             +
        '<li draggable class>'                                              +
            '<span draggable class="mini-icon directory"></span>'           +
            '<span draggable class=name>'                                   +
                '<a href="/fs/no-js/etc/X11/applnk" '                       +
                    'title="applnk" draggable=true>applnk</a>'              +
            '</span>'                                                       +
            '<span draggable class=size>&lt;dir&gt;</span>'                 +
            '<span draggable class=owner>root</span>'                       +
            '<span draggable class=mode>rwx r-x r-x</span>'                 +
        '</li>'                                                             +
        '<li draggable class>'                                              +
            '<span draggable class="mini-icon text-file"></span>'           +
            '<span draggable class=name>'                                   +
                '<a href="/fs/no-js/etc/X11/prefdm" '                       +
                    'target="_blank" title="prefdm" draggable=true>'        +
                        'prefdm'                                            +
                '</a>'                                                      +
            '</span>'                                                       +
            '<span draggable class=size>1.30kb</span>'                      +
            '<span draggable class=owner>root</span>'                       +
            '<span draggable class=mode>rwx r-x r-x</span>'                 +
        '</li>';
        
    for(var i = 0, n = lExpect.length; i < n; i++)
        if(lResult[i] !== lExpect[i]){
            console.log('Error in char number: ' + i    + '\n' +
                        'Expect: ' + lExpect.substr(i)  + '\n' +
                        'Result: ' + lResult.substr(i) );
            break;
        }
    if(i===n)
        console.log('CloudFunc.buildFromJSON: OK');
    
    
    function start(){
        return console.time('CloudFunc.buildFromJSON');
    }
    function end(){
        return console.timeEnd('CloudFunc.buildFromJSON');
    }
})();

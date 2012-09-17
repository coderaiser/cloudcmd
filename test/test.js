var CloudFunc = require('../lib/cloudfunc');
var assert = require('assert');

try{
    var lJSON = [{
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
   
    console.time('CloudFunc.buildFromJSON');
    var lResult = CloudFunc.buildFromJSON(lJSON);
    var lExpect =
        '<li class=path>'                                                   +
            '<span class="path-icon clear-cache"'                           +
                'id=clear-cache title="clear cache (Ctrl+D)">'              +
            '</span>'                                                       +
            '<span class="path-icon refresh-icon" title="refresh (Ctrl+R)">'+
                '<a href="/fs/no-js/etc/X11"></a></span>'                   +
            '<span>'                                                        +
                '<a class=links href="/fs/no-js" title=""/"">/</a>'         +
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
        '<li class=current-file>'                                           +
            '<span class="mini-icon directory"></span>'                     +
            '<span class=name><a href="/fs/no-js/etc">..</a></span>'        +
            '<span class=size>&lt;dir&gt;</span>'                           +
            '<span class=owner>.</span><span class=mode></span>'            +
        '</li>'                                                             +
        '<li class>'                                                        +
            '<span class="mini-icon directory"></span>'                     +
            '<span class=name>'                                             +
                '<a href="/fs/no-js/etc/X11/applnk">applnk</a>'             +
            '</span>'                                                       +
            '<span class=size>&lt;dir&gt;</span>'                           +
            '<span class=owner>root</span>'                                 +
            '<span class=mode>rwx r-x r-x</span>'                           +
        '</li>'                                                             +
        '<li class>'                                                        +
            '<span class="mini-icon text-file"></span>'                     +
            '<span class=name>'                                             +
                '<a href="/fs/no-js/etc/X11/prefdm" target="_blank">'       +
                    'prefdm'                                                +
                '</a>'                                                      +
            '</span>'                                                       +
            '<span class=size>1.30kb</span>'                                +
            '<span class=owner>root</span>'                                 +
            '<span class=mode>rwx r-x r-x</span>'                           +
        '</li>1';
    
        console.timeEnd('CloudFunc.buildFromJSON');
    assert.equal(
        lResult,
        lExpect, 'Something wrong in buildFromJSON');
}
catch(pError){
    console.log(pError);
}
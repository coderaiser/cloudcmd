'use strict';

var DIR                 = __dirname + '/../../',
    COMMONDIR           = DIR + 'common/',
    TMPLDIR             = DIR + 'tmpl/',
    
    Util                = require(COMMONDIR + 'util'),
    CloudFunc           = require(COMMONDIR + 'cloudfunc'),
    files               = require('files-io'),
    rendy               = require('rendy'),
    
    test                = require('tape'),
    
    FS_DIR              = TMPLDIR   + 'fs/',
    EXPECT_PATH         = DIR       + 'test/lib/cloudfunc.html',
    
    TMPL_PATH   = [
        'file',
        'path',
        'pathLink',
        'link',
    ],
    
    JSON_FILES          = {
        path  : '/etc/X11/',
        files : [{
            name: 'applnk',
            size: 'dir',
            date: '21.02.2016',
            uid : 0,
            mode: 'rwx r-x r-x'
        }, {
            name: 'prefdm',
            size: '1.30kb',
            date: '21.02.2016',
            uid : 0,
            mode: 'rwx r-x r-x'
        }]
    },
    
    Expect =
        '<div data-name="js-path" class="reduce-text" title="/etc/X11/">'       +
            '<span data-name="js-clear-storage" class="path-icon icon-clear" '  +
                'title="clear storage (Ctrl+D)">'                               +
            '</span>'                                                           +
            '<a data-name="js-refresh" href="/fs/etc/X11/" '                    +
            'class="path-icon icon-refresh" title="refresh (Ctrl+R)"></a>'      +
            '<span data-name="js-links" class=links>'                           +
                '<a data-name="js-path-link" href="/fs/" title="/">/</a>'       +
                '<a data-name="js-path-link" href="/fs/etc/" title="/etc/">'    +
                    'etc'                                                       +
                '</a>/X11/'                                                     +
            '</span>'                                                           +
        '</div>';

test(function(t) {
    var paths       = {},
        
        filesList   = TMPL_PATH.map(function(name) {
            var path = FS_DIR + name + '.hbs';
            
            paths[path] = name;
            
            return path;
        })
        .concat(EXPECT_PATH);
    
    files.read(filesList, 'utf8', function(error, files) {
        var isNotOk, expect, result,
            i           = 0,
            template    = {};
        
        if (error) {
            throw(new Error(error));
        } else {
            Util.time('CloudFunc.buildFromJSON');
            
            Object.keys(files).forEach(function(path) {
                var name = paths[path];
                
                if (path !== EXPECT_PATH)
                    template[name] = files[path];
            });
            
            expect          = files[EXPECT_PATH];
            
            result          = CloudFunc.buildFromJSON({
                prefix  : '',
                data    : JSON_FILES,
                template: template
            });
            
            Expect          += expect;
            
            isNotOk = Expect.split('').some(function(item, number) {
                var ret = result[number] !== item;
                
                if (ret)
                    i = number;
                
                return ret;
            });
            
            Util.timeEnd('CloudFunc.buildFromJSON');
            
            if (isNotOk) {
                console.log(rendy([
                    'Error in char number: {{ number }}',
                    'Expect: {{ expect }}',
                    'Result: {{ result }}'
                ].join('\n'), {
                    number: i,
                    expect: Expect.substr(i),
                    result: result.substr(i)
                }));
                
                console.log('buildFromJSON: Not OK');
            }
            
            t.equal(Expect, result, 'should be equal rendered json data');
            
            t.end();
        }
    });
});


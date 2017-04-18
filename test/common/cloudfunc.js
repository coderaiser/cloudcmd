'use strict';

const DIR = __dirname + '/../../';
const COMMONDIR = DIR + 'common/';
const TMPLDIR = DIR + 'tmpl/';

const Util = require(COMMONDIR + 'util');
const CloudFunc = require(COMMONDIR + 'cloudfunc');
const files = require('files-io');

const test = require('tape');
const htmlLooksLike = require('html-looks-like');

const FS_DIR = TMPLDIR   + 'fs/';
const EXPECT_PATH = __dirname + '/cloudfunc.html';

const TMPL_PATH = [
    'file',
    'path',
    'pathLink',
    'link',
];

const JSON_FILES = {
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
};

let Expect =
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

test('render', (t) => {
    const paths = {};
    const filesList = TMPL_PATH
        .map((name) => {
            const path = FS_DIR + name + '.hbs';
            
            paths[path] = name;
            
            return path;
        })
        .concat(EXPECT_PATH);
    
    files.read(filesList, 'utf8', (error, files) => {
        const template = {};
        
        if (error)
            throw(Error(error));
            
        Util.time('CloudFunc.buildFromJSON');
        
        Object.keys(files).forEach((path) => {
            const name = paths[path];
            
            if (path !== EXPECT_PATH)
                template[name] = files[path];
        });
        
        const expect = files[EXPECT_PATH];
        const result = CloudFunc.buildFromJSON({
            prefix  : '',
            data    : JSON_FILES,
            template: template
        });
        
        Expect += expect;
        
        let i;
        const isNotOk = Expect
            .split('')
            .some((item, number) => {
                const ret = result[number] !== item;
                
                if (ret) {
                    i = number;
                }
                
                return ret;
            });
        
        Util.timeEnd('CloudFunc.buildFromJSON');
        
        if (isNotOk) {
            console.log(
                `Error in char number: ${i}\n`,
                `Expect: ${Expect.substr(i)}\n`,
                `Result: ${result.substr(i)}`
            );
            
            console.log('buildFromJSON: Not OK');
        }
        
        t.equal(Expect, result, 'should be equal rendered json data');
        
        htmlLooksLike(Expect, result);
        
        t.end();
    });
});


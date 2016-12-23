(function() {
    'use strict';
    
    var test    = require('tape'),
        DIR     = '../../',
        Util    = require(DIR + 'common/util');
    
    
    test('getExt: no extension', function(t) {
        var EXT     = '',
            name    = 'file-withot-extension',
            ext     = Util.getExt(name);
        
        t.equal(ext, EXT, 'should return "" when extension is none');
        t.end();
    });
    
    test('getExt: return extension', function(t) {
        var EXT     = '.png',
            name    = 'picture.png',
            ext     = Util.getExt(name);
        
        t.equal(ext, EXT, 'should return ".png" in files "picture.png"');
        t.end();
    });
    
})();

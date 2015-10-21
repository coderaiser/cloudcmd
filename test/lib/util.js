(function() {
    'use strict';
    
    /*global describe, it */
    
    var should  = require('should'),
        DIR     = '../../',
        Util    = require(DIR + 'lib/util');
    
    describe('Util', function() {
        describe('getExt', function() {
            it('should return "" when extension is none', function() {
                var EXT     = '',
                    name    = 'file-withot-extension',
                    ext     = Util.getExt(name);
                
                 should(ext).eql(EXT);
            });
            
            it('should return ".png" in files "picture.png"', function() {
                var EXT     = '.png',
                    name    = 'picture.png',
                    ext     = Util.getExt(name);
                
                 should(ext).eql(EXT);
            });
        });
    });
    
})();

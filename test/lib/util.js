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
        
        describe('checkExt', function() {
            it('should return true when extension is same', function() {
                var EXT     = 'png',
                    name    = 'picture.png',
                    same    = Util.checkExt(name, EXT);
                
                 same.should.be.true;
            });
            
            it('should return false when extension is not same', function() {
                var EXT     = 'jpg',
                    name    = 'picture.png',
                    same    = Util.checkExt(name, EXT);
                
                 same.should.be.false;
            });
            
            it('should return true when one item of extensions array is same', function() {
                var EXT     = ['jpg', 'png'],
                    name    = 'picture.png',
                    same    = Util.checkExt(name, EXT);
                
                 same.should.be.true;
            });
            
            it('should return false when no one item of extensions array is same', function() {
                var EXT     = ['jpg', 'gif'],
                    name    = 'picture.png',
                    same    = Util.checkExt(name, EXT);
                
                 same.should.be.false;
            });
        });
        
        describe('exec', function() {
            it('should execute function with parameters', function() {
                var WORD    = 'hello',
                    func    = function(word) {
                        return word;
                    },
                    word  = Util.exec(func, WORD);
                
                 WORD.should.equal(word);
            });
            
            it('should not execute function, if type of first argument not function', function() {
                var WORD    = 'hello',
                    word  = Util.exec(WORD);
                
                 (word === undefined).should.be.true;
            });
        });
        
    });
    
})();

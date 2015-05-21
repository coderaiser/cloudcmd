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
        
        describe('exec.ret', function() {
            it('should return function that try to call callback', function() {
                var STR     = 'hello world',
                    func1   = function() {
                        var args = [].slice.call(arguments);
                        
                        return args.join(' ');
                    },
                    func2   = Util.exec.ret(func1, 'hello'),
                    str     = func2('world');
                
                str.should.be.equal(STR);
            });
            
        });
        
        describe('exec.parallel', function() {
            it('should execute a couple functions async and return results in callback', function() {
                var WORD    = 'hello world',
                    funcSlow    = function(callback) {
                        setTimeout(function() {
                            callback(null, 'hello');
                        }, 10);
                    },
                    funcFast    = function(callback) {
                        setTimeout(function() {
                            callback(null, 'world');
                        }, 1);
                    };
                    
                    Util.exec.parallel([funcSlow, funcFast], function(error, hello, world) {
                        WORD.should.equal(hello + ' ' + world);
                    });
            });
            
        });
    });
    
})();

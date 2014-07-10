#!/usr/bin/env node

(function(){
    'use strict';
    
    var CloudCmd    = require('../cloudcmd'),
        DIR         = '../lib/',
        Util        = require(DIR + 'util'),
        argv        = process.argv,
        length      = argv.length - 1,
        argvLast    = argv[length],
        regExp      = new RegExp('^test'),
        isTest      = argvLast.match(regExp);
    
    if (isTest) {
        Util.log('Cloud Commander testing mode');
        Util.log('argv: ', argv);
    }
    
    CloudCmd.start({
        isTest: isTest
    });
    
})();


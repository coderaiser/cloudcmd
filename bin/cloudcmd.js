#!/usr/bin/env node

(function(){
    'use strict';
    
    var CloudCmd    = require('../cloudcmd'),
        DIR         = '../lib/',
        Util        = require(DIR + 'util'),
        argv        = process.argv,
        length      = argv.length - 1,
        argvFirst   = argv[length],
        isTest      = Util.isContainStr(argvFirst, 'test');
    
    if (isTest) {
        Util.log('Cloud Commander testing mode');
        Util.log('argv: ', argv);
    }
    
    CloudCmd.start({
        isTest: isTest
    });
    
})();


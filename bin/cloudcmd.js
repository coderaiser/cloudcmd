#!/usr/bin/env node

(function(){
    'use strict';
    
    var CloudCmd    = require('../cloudcmd'),
        DIR         = '../lib/',
        Util        = require(DIR + 'util'),
        argv        = process.argv,
        length      = argv.length - 1,
        argvLast    = argv[length],
        isTest;
    
    switch (argvLast) {
    case '--test':
        Util.log('Cloud Commander testing mode');
        Util.log('argv: ', argv);
        
        isTest = true;
        break;
    }
    
    CloudCmd.start({
        isTest: isTest
    });
    
})();

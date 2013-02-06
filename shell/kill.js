#!/usr/bin/env node
/* c9.io kill active node process */

(function(){
    'use strict';
    
    var exec    = require('child_process').exec,
        lCmd    = 'kill -9'             +   ' ' + /* kill finded process */
                  '`ps ax'              +   '|' + /* show all process    */
                  'grep node-openshift' +   '|' + /* find node-openshift */
                  'grep -v grep'        +   '|' + /* exlude grep command */
                  'awk "{print $1}"`';            /* show first collumn  */
    
    exec(lCmd, function(error, stdout, stderr){
        console.log(error || stdout || stderr);
    });
    
})();

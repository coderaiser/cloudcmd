"use strict";
var Server  = cloudRequire('./server'),
    path    = cloudRequire('path'),
    fs      = cloudRequire('fs');

var Config = readConfig();

Config ? Server.start(Config) : Server.start();


function readConfig(){
    
    /* Determining server.js directory
     * and chang current process directory
     * (usually /) to it.
     * argv[1] - is always script name
     */
    var lServerDir = path.dirname(process.argv[1]),
        lProcessDir = process.cwd();
        lConfig     = {};
    
    if(lProcessDir !== lServerDir){
        console.log('current dir: ' + lProcessDir);
        process.chdir(lServerDir);
    }
    console.log('server dir:  ' + lServerDir);
    
    console.log('reading configuretion file config.json...');
    var lConfig = cloudRequire('./config');
    if(lConfig){
        console.log('config.json readed');
        
        /* if command line parameter testing resolved 
         * setting config to testing, so server
         * not created, just init and
         * all logs writed to screen
         */
        var lArg = process.argv[process.argv.length - 1];
        if ( lArg === 'test' ||  lArg === 'test\r') {
            console.log(process.argv);
            lConfig.server  = false;
            lConfig.logs    = false;
        }
                    
        if (lConfig.logs) {
            console.log('log param setted up in config.json\n' +
                'from now all logs will be writed to log.txt');
            writeLogsToFile();
        }
        
        return lConfig;
    }
    else return false;
}

/* function sets stdout to file log.txt */
function writeLogsToFile(){
    var stdo = fs.createWriteStream('./log.txt');
    
    process.stdout.write = (function(write) {
            return function(string, encoding, fd) {
                    stdo.write(string);
            };
    })(process.stdout.write);
}

/* function do safe require of needed module */
function cloudRequire(pModule){
  try{
      return require(pModule);
  }
  catch(pError){
      return false;
  }
}
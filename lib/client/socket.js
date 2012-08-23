/* module make possible connectoin thrue socket.io on a client */
var CloudCommander, io;
(function(){
    "use strict";
    var Util = CloudCommander.Util;
    
    Util.jsload("http://localhost:31337/socket.io/lib/socket.io.js", function(){
        var socket = io.connect('http://localhost:31337/');
        socket.on('connect', function () {
        socket.send('hi');
        
        socket.on('message', function (msg) {
          console.log(msg);
        });
        });
    });
})();
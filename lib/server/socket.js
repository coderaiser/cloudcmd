/* module make possible connectoin thrue socket.io on a server */

var CloudServer;

var io = require('socket.io').listen(CloudServer.Server);

io.sockets.on('connection', function (socket) {
socket.on('message', function (data) {
  console.log(data);
});

socket.on('disconnect', function () { });
});
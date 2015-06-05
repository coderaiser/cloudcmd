// Working demo: http://jsbin.com/ozusa6/2/
(function () {

function triggerEvent(type) {
  var event = document.createEvent('HTMLEvents');
  event.initEvent(type, true, true);
  event.eventName = type;
  (document.body || window).dispatchEvent(event);
}

function testConnection() {
  // make sync-ajax request
  var xhr = new XMLHttpRequest();
  // phone home
  xhr.open('HEAD', '/', false); // async=false
  try {
    xhr.send();
    onLine = true;
  } catch (e) {
    // throws NETWORK_ERR when disconnected
    onLine = false;
  }

  return onLine; 
}

var onLine = true,
    lastOnLineStatus = true;

// note: this doesn't allow us to define a getter in Safari
navigator.__defineGetter__("onLine", testConnection);
testConnection();

if (onLine === false) {
  lastOnLineStatus = false;
  // trigger offline event
  triggerEvent('offline');
}

setInterval(function () {
  testConnection();
  if (onLine !== lastOnLineStatus) {
    triggerEvent(onLine ? 'online' : 'offline');
    lastOnLineStatus = onLine;
  }
}, 5000); // 5 seconds, made up - can't find docs to suggest interval time
})();

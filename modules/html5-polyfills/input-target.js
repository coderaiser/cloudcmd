(function () {
  
// setup for detection
var form = document.createElement('form'),
    input = document.createElement('input'),
    body = document.body,
    id = 'f' + +new Date,
    inputTargetSupported = false;

// insert into DOM, work out if it's supported
form.setAttribute('id', id);
input.setAttribute('form', id);
body.appendChild(form);
body.appendChild(input);

inputTargetSupported = input.form !== null;
body.removeChild(form);
body.removeChild(input);

// if not, hook click handlers to all existing submit elements
function click(event) {
  event = event || window.event;
  
  // http://www.quirksmode.org/js/events_properties.html#target
  var target = event.target || event.srcElement;
	if (target.nodeType === 3) target = target.parentNode;
	
	if (target.nodeName === 'INPUT' && target.type === 'submit' && target.form === null) {
	  form = document.getElementById(target.getAttribute('form'));
	  var clone = target.cloneNode(true);
	  clone.style.display = 'none';
	  form.appendChild(clone);
	  clone.click(); // doing this because form.submit won't fire handles the way I want
	  form.removeChild(clone);
	}
}

if (!inputTargetSupported) {
  body.addEventListener ? body.addEventListener('click', click, false) : body.attachEvent('onclick', click);
}

})();

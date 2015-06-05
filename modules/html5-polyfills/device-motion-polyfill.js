/**
 * DeviceMotion and DeviceOrientation polyfill
 * by Remy Sharp / leftlogic.com
 * MIT http://rem.mit-license.org
 *
 * Usage: used for testing motion events, include
 * script in head of test document and allow popup
 * to open to control device orientation.
 */
(!document.DeviceOrientationEvent || !document.DeviceMotionEvent) && (function () {

// thankfully we don't have to do anything, because the event only fires on the window object
var polyfill = {
  motion: !document.DeviceMotionEvent,
  orientation: !document.DeviceOrientationEvent
};

if (polyfill.orientation) window.DeviceOrientationEvent = function () {};

if (polyfill.motion) window.DeviceMotionEvent = function () {};

// images - yes I do like to be self contained don't I?! :)
var imageSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAACpCAYAAABEbEGLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxODkwMDQ2NTNDNEYxMUUxQTYyOTk2M0QwMjU4OThGOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxODkwMDQ2NjNDNEYxMUUxQTYyOTk2M0QwMjU4OThGOCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE4OTAwNDYzM0M0RjExRTFBNjI5OTYzRDAyNTg5OEY4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjE4OTAwNDY0M0M0RjExRTFBNjI5OTYzRDAyNTg5OEY4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jKamsAAAAtNJREFUeNrs2t1t01AYgGG3dACPkA3qEcIlV5QJSCdAnaAwAWKCsgFs0HQChwmaS+6SThCOKwuigtP4J+ln9LzSRyWaRMmTE8fHcJLt3yRNkeY8U9VDmkWa+ZAPOktTptmYf84qzU29GDtXQG49111XM7xuUy3QfF/oa2DHAbeijwReABp8vjVh+zI8zFw4fBxv7q3qF1jdp1s7Qx2ut9UfZ0Gh+26BJ313dANXRDuvXg38xuf1NjrKoeTxMBKlq/rCzlCt01zWP0N0GujjtjzQ4y4iYS+DPJd8ZI/bCTtKHw7wmLNIJwBngbCn9QZgOcDZSF4/XqgzrUjY26ds0//xZPs0E2zYgg1bsGHDFuwRt2sHOcfTqSJruPi1C/s1t07dZg2XGxxGHLNhCzZswYYNW7BhCzZs2IINW7BhCzZs2IINW7BhwxZs2IINW7BhwxZs2IING7ZgwxZs2IING7ZgwxZs2LAFG7Zgw4Yt2LAFG7Zgw4Yt2LAFGzZswYYt2LAFGzZswYYt2LBhCzZswYYt2LBhCzZswYYNW7BhCzZs2IINW7BhCzZs2IINW7BhwxZs2IIdvbMdv7vG06lJF+yP3BxGYAs2bGcj8VukmadZb/1dkWaaJh/Li6hO8TaB57YGbSofwWvYjAH7psWiqd6QVWTsyMfsr2kuW9x+3vL2viDrlmmuOtzve/0mwW7RlydfhG36BLv9Cu3zqVjCbgf2kve3qRl5OezjtY6KPXnh+x/sMPIj4POa9oSOhr3YfnLRdlv3PV7YTfSdcBnwCX7uAF0E3apfbD/JWdAnOWsJvRrLp7TM4l6Meu4S6kXgi1C/V/XJk5VRRj1tqq953GV/X89+X/+MuhN+1/TLqIeTMU759BP5quEUZZqp7+WCN2l+7nNjK3zAFb3vt3sJr9X0/l9kM+g7Z1WfMT27az1puQ2uVvu5Q/JjD9mff/Hfq18CDADFyFpnRW9JPwAAAABJRU5ErkJggg==';

var imageBackSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAACpCAIAAADLDtbcAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3OTFCRTMwQTNDNjMxMUUxQTYyOTk2M0QwMjU4OThGOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3OTFCRTMwQjNDNjMxMUUxQTYyOTk2M0QwMjU4OThGOCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE4OTAwNDZCM0M0RjExRTFBNjI5OTYzRDAyNTg5OEY4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjE4OTAwNDZDM0M0RjExRTFBNjI5OTYzRDAyNTg5OEY4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+zWf2VgAABt9JREFUeNrsnU1P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';

var id = (+new Date).toString(32),
		body = document.documentElement, // yep - cheatin' Yud'up! :)
		height = 320;

// if the url hash doesn't contain tiltremote (our key) then fireup the popup, else we are the popup
if (window.location.hash.indexOf('tiltremote') === -1) {
	initServer();
} else {
	initRemote();
}

function initServer() {
	// old way didn't work. Shame, but I like the new way too :)
	// var remote = window.open('data:text/html,<script src="' + src + '?tiltremote"></script>', 'Tilt', 'width=300,height=' + height);
	
	var remote = window.open(window.location.toString() + '#tiltremote', 'Tilt', 'width=300,height=' + height);
	if (!remote) {
		alert('The remote control for the orientation event uses a popup')
	}

	// TODO add remote-tilt.com support
}

function initRemote() {
	var TO_RADIANS = Math.PI / 180;
			orientation = {
				alpha: 180,
				beta: 0,
				gamma: 0
			},
			accelerationIncludingGravity = { x: 0, y: 0, z: -9.81 },
			guid = (+new Date).toString(32);	

	function update(fromInput) {
		var preview = document.getElementById('preview');
		preview.style.webkitTransform = 'rotateY('+ gamma.value + 'deg) rotate3d(1,0,0, '+ (beta.value*-1) + 'deg)';
  	preview.parentNode.style.webkitTransform = 'rotate(' + (180-orientation.alpha) + 'deg)';

    if (!fromInput) {
    	for (var key in orientation) {
    		var el = document.getElementById(key);
    		oninput.call(window, { target: el });
    	}
    }

    fireEvent();
	}

	function fireDeviceOrienationEvent() {
    var event = document.createEvent('HTMLEvents');
    event.initEvent('deviceorientation', true, true);
    event.eventName = 'deviceorientation';
    event.alpha = orientation.alpha;
    event.beta = orientation.beta;
    event.gamma = orientation.gamma;
    
    window.opener.dispatchEvent(event);
	}

	function fireDeviceMotionEvent() {
    var event = document.createEvent('HTMLEvents');
    event.initEvent('devicemotion', true, true);
    event.eventName = 'devicemotion';

    event.accelerationIncludingGravity = {};
    event.accelerationIncludingGravity.x = accelerationIncludingGravity.x;
    event.accelerationIncludingGravity.y = accelerationIncludingGravity.y;
    event.accelerationIncludingGravity.z = accelerationIncludingGravity.z;
    
    window.opener.dispatchEvent(event);
	}

	function fireEvent() {
		if (polyfill.orientation) fireDeviceOrienationEvent();
		if (polyfill.motion) fireDeviceMotionEvent();
	}

	// hides the old body - but doesn't prevent the JavaScript from running.
  // just a clean up thing - lame, but tidier
	setTimeout(function () {
		var bodies = document.getElementsByTagName('body'),
				body = bodies[1];
		if (bodies.length == 2) {
			if (body.id == guid) body = bodies[0];
		}
		document.documentElement.removeChild(body);
	});

	body.innerHTML = ['<head><title>Motion Emulator</title>',
		'<style>',
		'html { height: ' + height + 'px; }',
		'body { margin: 10px; font-family: sans-serif; overflow: hidden; }',
		'#pov { height: 170px; position: relative; -webkit-perspective: 500; perspective: 500; cursor: move; }',
		'#controls { position: relative; z-index: 1; }',
		'#preview { display: block; margin: 20px auto; max-width: 100%; width: 100px; height: 170px;  }',
		'#preview div { width: 100%; height: 170px; position: absolute; top: 0; left: 0; -webkit-backface-visibility: hidden; }',
		'#front { background: url(' + imageSrc + ') no-repeat center; }',
		'#back { background: url(' + imageBackSrc + ') no-repeat center; -webkit-transform: rotateY(180deg); }',
		'label { display: block; clear: both; }',
		'label input[type=range] { display:inline-block; float: right; }',
		'#buttons { margin-top: 2px; }',
		'#south { position: absolute; bottom: 0; width: 100%; left: 0; text-align: center; color: #aaa; }',
		'</style>',
		'</head>',
		'<body id="' + guid + '">',
		'<div id=controls>',
		'<label for=gamma>Left - Right <input min=-180 max=180 id=gamma value=0 type=range step=0.001>  <output id=og>0</output></label>',
		'<label for=beta>Back - Front <input min=-180 max=180 id=beta value=0 type=range step=0.001> <output id=ob>0</output></label>',
		'<label for=alpha>Rotate <input min=0 max=360 id=alpha value=180 type=range step=0.001> <output id=oa>180</output></label>',
		'<label for=wobble>Emulate slight shake<input type=checkbox id=wobble></label>',
		'<div id=buttons><button id=flat>Flat on it\'s back</button> ',
		'</div>',
		'</div>', // end of controls
		'<div id=pov>',
			'<div id=preview>',
				'<div id=front></div>',
				'<div id=back></div>',
			'</div>',
		'</div>',
		'<span id=south>south</span>',
		'</body>'
	].join('');

	function oninput(event) {
		var target = event.target;
		if (target.nodeName == 'INPUT') {

			var value = target.value * 1;

			if (target.id == 'beta') {
				// parseFloat + toFixed avoids the massive 0.00000000 and infinitely small numbers
				accelerationIncludingGravity.z = parseFloat( (Math.sin( (TO_RADIANS * (value - 90))) * 9.81).toFixed(10) );
				accelerationIncludingGravity.y = parseFloat((Math.sin( (TO_RADIANS * (value - 180))) * 9.81).toFixed(10));
				value = parseFloat((Math.sin(value * TO_RADIANS) * 90).toFixed(10));
			} else if (target.id == 'gamma') {
				accelerationIncludingGravity.x = parseFloat( (Math.sin( (TO_RADIANS * (value - 180))) * -9.81).toFixed(10) );
			}

			document.getElementById('o' + target.id.substring(0, 1)).value = parseFloat(value.toFixed(2));

			orientation[target.id] = value;

			if (this !== window) update(true); // i.e. if not called manually
		} 
	}

	body.addEventListener('input', oninput, false);

	var down = false,
			last = { x: null, y: null },
			pov = document.getElementById('pov'),
			alpha = document.getElementById('alpha'),
			beta = document.getElementById('beta'),
			gamma = document.getElementById('gamma');
	
	pov.addEventListener('mousedown', function (event) {
		down = true;
		last.x = event.pageX;
		last.y = event.pageY;
		event.preventDefault();
	}, false);

	body.addEventListener('mousemove', function (event) {
		if (down) {
			var dx = (last.x - event.pageX)// * 0.1,
					dy = (last.y - event.pageY); // * 0.1;
			last.x = event.pageX;
			last.y = event.pageY;
			gamma.value -= dx;
			beta.value -= dy;
			update();
		}
	}, false);

	body.addEventListener('mouseup', function (event) {
		down = false;
	}, false);

	body.addEventListener('click', function (event) {
		var target = event.target;	
		if (target.nodeName == 'BUTTON') {
			if (target.id == 'flat') {
				alpha.value = 180;
				beta.value = 0;
				gamma.value = 0;
				
			}
			update();
		} else if (target.id == 'wobble') {
			if (target.checked) startShake();
			else stopShake();
		}
	}, false);

	function startShake() {
		shake = setInterval(function () {
			alpha.value = parseFloat(alpha.value) + (Math.random() * (Math.random() < 0.5 ? 1 : -1) * 0.05);
			beta.value = parseFloat(beta.value) + (Math.random() * (Math.random() < 0.5 ? 1 : -1) * 0.05);
			gamma.value = parseFloat(gamma.value) + (Math.random() * (Math.random() < 0.5 ? 1 : -1) * 0.05);	
			update();
		}, 100);
	}

	function stopShake() {
		clearInterval(shake);
	}

	update();
}

})();

















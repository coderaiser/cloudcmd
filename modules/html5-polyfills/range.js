/**
 * This was from a proposal that James Edwards / Brothercake had during
 * 2011 Highland Fling - to use select elements as a starting point for
 * the range element - so it's a pretty darn good fit, I put this together
 * during his Q&A. In the end I needed to lift the detection code from 
 * Modernizr - which credit really goes to @miketaylr.
 * My code starts from "if (bool) {"
 *
 * This code is looking for <select type="range"> and will progressively
 * enhance to a input[type=range] copying much of the attributes across.
 */
!function () {
var rangeTest = document.createElement('input'),
    smile = ':)';
rangeTest.setAttribute('type', 'range');

var bool = rangeTest.type !== 'text';
if (bool) {
  rangeTest.style.cssText = 'position:absolute;visibility:hidden;';
  rangeTest.value = smile;
  if (rangeTest.style.WebkitAppearance !== undefined ) {

    document.body.appendChild(rangeTest);
    defaultView = document.defaultView;

    // Safari 2-4 allows the smiley as a value, despite making a slider
    bool =  defaultView.getComputedStyle &&
            defaultView.getComputedStyle(rangeTest, null).WebkitAppearance !== 'textfield' &&
            // Mobile android web browser has false positive, so must
            // check the height to see if the widget is actually there.
            (rangeTest.offsetHeight !== 0);

    document.body.removeChild(rangeTest);
  }
} else {
  bool = rangeTest.value == smile;
}

// if the input[range] is natively supported, then upgrade the <select type="range">
// into a range element.
if (bool) {
 function firstChild(el, nodeName) {
    nodeName = nodeName.toUpperCase();
    if (el.firstChild.nodeName === nodeName) {
      return el.firstChild;
    } else {
      return el.firstChild.nextSibling;
    }
  }

  function lastChild(el, nodeName) {
    nodeName = nodeName.toUpperCase();
    if (el.lastChild.nodeName === nodeName) {
      return el.lastChild;
    } else {
      return el.lastChild.previousSibling;
    }
  }

 var selects = document.getElementsByTagName('select'),
     i = 0;

  for (; i < selects.length; i++) {
    if (selects[i].getAttribute('data-type') == 'range') (function (select) {
      var range = document.createElement('input'),
          parent = select.parentNode;
          
      range.setAttribute('type', 'range');
      // works with the select element removed from the DOM
      select = parent.replaceChild(range, select);
      range.autofocus = select.autofocus;
      range.disabled = select.disabled;
      range.autocomplete = select.autocomplete; // eh? how would this even work?
      range.className = select.className;
      range.id = select.id;
      range.style = select.style;
      range.tabindex = select.tabindex;
      range.title = select.title;
      range.min = firstChild(select, 'option').value;
      range.max = lastChild(select, 'option').value;
      range.value = select.value;
      range.name = select.name;
      // Add step support
      if ( select.getAttribute('data-type-range-step') ) {
        range.step = select.getAttribute('data-type-range-step');
      }
      // yeah, this is filth, but it's because getElementsByTagName is
      // a live DOM collection, so when we removed the select element
      // the selects object reduced in length. Freaky, eh?
      i--;
    })(selects[i]);
  }
}
}();

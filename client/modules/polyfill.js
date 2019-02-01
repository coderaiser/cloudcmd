'use strict';

/* global DOM */

require('domtokenlist-shim');

const scrollIntoViewIfNeeded = require('scroll-into-view-if-needed').default;
DOM.scrollIntoViewIfNeeded = (el) => scrollIntoViewIfNeeded(el, {
    block: 'nearest',
});


/* global DOM */

import 'domtokenlist-shim';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

DOM.scrollIntoViewIfNeeded = (el) => scrollIntoViewIfNeeded(el, {
    block: 'nearest',
});


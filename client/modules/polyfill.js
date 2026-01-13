'use strict';

require('domtokenlist-shim');

const _scrollIntoViewIfNeeded = require('scroll-into-view-if-needed');

globalThis.DOM = globalThis.DOM || {};

const scrollIntoViewIfNeeded = (el, overrides = {}) => {
    const {
        scroll = _scrollIntoViewIfNeeded,
    } = overrides;
    
    return scroll(el, {
        block: 'nearest',
    });
};

globalThis.DOM.scrollIntoViewIfNeeded = scrollIntoViewIfNeeded;
module.exports.scrollIntoViewIfNeeded = scrollIntoViewIfNeeded;

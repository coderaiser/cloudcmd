import _scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

globalThis.DOM = globalThis.DOM || {};

export const scrollIntoViewIfNeeded = (el, overrides = {}) => {
    const {
        scroll = _scrollIntoViewIfNeeded,
    } = overrides;
    
    return scroll(el, {
        block: 'nearest',
    });
};

globalThis.DOM.scrollIntoViewIfNeeded = scrollIntoViewIfNeeded;

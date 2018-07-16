'use stric';

const test = require('tape');
const mockRequire = require('mock-require');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

test('cloudcmd: client: polyfill: scrollIntoViewIfNeaded', (t) => {
    const {DOM} = global;
    const scroll = sinon.stub();
    const el = {};
    
    global.DOM = {};
    
    mockRequire('scroll-into-view-if-needed', {
        default: scroll
    });
    
    mockRequire.reRequire('./polyfill');
    
    global.DOM.scrollIntoViewIfNeeded(el);
    mockRequire.stop('scroll-into-view-if-neaded');
    global.DOM = DOM;
    
    const args = [
        el, {
            block: 'nearest',
        }];
    
    t.ok(scroll.calledWith(...args), 'should call scrollIntoViewIfNeaded');
    t.end();
});

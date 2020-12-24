import test from 'supertape';
import mockRequire from 'mock-require';
import stub from '@cloudcmd/stub';

test('cloudcmd: client: polyfill: scrollIntoViewIfNeaded', (t) => {
    const {DOM} = global;
    const scroll = stub();
    const el = {};
    
    global.DOM = {};
    
    mockRequire('scroll-into-view-if-needed', {
        default: scroll,
    });
    
    mockRequire.reRequire('./polyfill');
    
    global.DOM.scrollIntoViewIfNeeded(el);
    mockRequire.stop('scroll-into-view-if-neaded');
    global.DOM = DOM;
    
    const args = [
        el, {
            block: 'nearest',
        }];
    
    t.calledWith(scroll, args, 'should call scrollIntoViewIfNeaded');
    t.end();
});

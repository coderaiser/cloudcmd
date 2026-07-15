import {test} from 'supertape';
import {createBinder} from './binder.js';

test('client: key: binder: isBind: default', (t) => {
    const binder = createBinder();
    
    t.notOk(binder.isBind(), 'should not be bind by default');
    t.end();
});

test('client: key: binder: setBind', (t) => {
    const binder = createBinder();
    
    binder.setBind();
    
    t.ok(binder.isBind(), 'should be bind');
    t.end();
});

test('client: key: binder: unsetBind', (t) => {
    const binder = createBinder();
    
    binder.setBind();
    binder.unsetBind();
    
    t.notOk(binder.isBind(), 'should not be bind');
    t.end();
});

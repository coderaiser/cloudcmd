import {test, stub} from 'supertape';
import {pickRenderer} from './pick-renderer.js';

test('cloudcmd: client: config: pickRenderer: rendy', (t) => {
    const rendy = stub();
    const putout = stub();
    
    const result = pickRenderer('rendy', {
        rendy,
        putout,
    });
    
    t.equal(result, rendy);
    t.end();
});

test('cloudcmd: client: config: pickRenderer: putout', (t) => {
    const rendy = stub();
    const putout = stub();
    
    const result = pickRenderer('putout', {
        rendy,
        putout,
    });
    
    t.equal(result, putout);
    t.end();
});

test('cloudcmd: client: config: pickRenderer: unknown: rendy', (t) => {
    const rendy = stub();
    
    const result = pickRenderer('hello', {
        rendy,
    });
    
    t.equal(result, rendy);
    t.end();
});

test('cloudcmd: client: config: pickRenderer: no name: rendy', (t) => {
    const rendy = stub();
    
    const result = pickRenderer(undefined, {
        rendy,
    });
    
    t.equal(result, rendy);
    t.end();
});

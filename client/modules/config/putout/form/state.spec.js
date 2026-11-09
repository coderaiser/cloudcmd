import {test} from 'supertape';
import {createState} from './state.js';

test('cloudcmd: client: config: putout: form: state: read', (t) => {
    const config = {
        port: 8000,
    };
    
    const {read} = createState(config);
    const result = read();
    
    t.deepEqual(result, config);
    t.end();
});

test('cloudcmd: client: config: putout: form: state: read: copy', (t) => {
    const config = {
        port: 8000,
    };
    
    const {read} = createState(config);
    const result = read();
    
    t.notEqual(result, config);
    t.end();
});

test('cloudcmd: client: config: putout: form: state: commit', (t) => {
    const {read, commit} = createState({
        port: 8000,
    });
    
    commit('port', 8001);
    
    const result = read();
    const expected = {
        port: 8001,
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: state: commit: keep other fields', (t) => {
    const {read, commit} = createState({
        port: 8000,
        auth: true,
    });
    
    commit('port', 8001);
    
    const result = read();
    const expected = {
        port: 8001,
        auth: true,
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: putout: form: state: commit: do not change the config', (t) => {
    const config = {
        port: 8000,
    };
    
    const {commit} = createState(config);
    
    commit('port', 8001);
    
    const expected = {
        port: 8000,
    };
    
    t.deepEqual(config, expected);
    t.end();
});

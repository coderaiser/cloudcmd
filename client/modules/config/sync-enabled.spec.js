import {test, stub} from 'supertape';
import {syncEnabled} from './sync-enabled.js';

const createRoot = ({checkboxes, dependents}) => ({
    querySelectorAll: (selector) => selector === '[data-enabled-by]' ? dependents : [],
    querySelector: (selector) => {
        const [, name] = selector.match(/data-name="js-([^"]+)"/);
        
        return checkboxes[name];
    },
});

const createDependent = (enabledBy) => ({
    dataset: {
        enabledBy,
    },
    disabled: false,
});

test('cloudcmd: client: config: sync-enabled: checkbox is off', (t) => {
    const username = createDependent('auth');
    const root = createRoot({
        checkboxes: {
            auth: {
                checked: false,
            },
        },
        dependents: [username],
    });
    
    syncEnabled(root);
    
    t.ok(username.disabled);
    t.end();
});

test('cloudcmd: client: config: sync-enabled: checkbox is on', (t) => {
    const username = createDependent('auth');
    
    username.disabled = true;
    
    const root = createRoot({
        checkboxes: {
            auth: {
                checked: true,
            },
        },
        dependents: [username],
    });
    
    syncEnabled(root);
    
    t.notOk(username.disabled);
    t.end();
});

test('cloudcmd: client: config: sync-enabled: each dependent follows its checkbox', (t) => {
    const username = createDependent('auth');
    const token = createDependent('oneFilePanel');
    
    const root = createRoot({
        checkboxes: {
            auth: {
                checked: true,
            },
            oneFilePanel: {
                checked: false,
            },
        },
        dependents: [username, token],
    });
    
    syncEnabled(root);
    
    const result = [username.disabled, token.disabled];
    const expected = [false, true];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd: client: config: sync-enabled: no dependents', (t) => {
    const root = {
        querySelectorAll: () => [],
        querySelector: stub(),
    };
    
    syncEnabled(root);
    
    t.notCalled(root.querySelector);
    t.end();
});

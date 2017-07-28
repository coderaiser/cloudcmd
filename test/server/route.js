'use strict';

const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const route = require('../../server/route');
const before = require('../before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);
const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const getStr = (url) => {
    return get(url)
        .then(warp(_pullout, 'string'))
        .catch(console.log);
};


test('cloudcmd: route: no args', (t) => {
    t.throws(route, /req could not be empty!/, 'should throw when no args');
    t.end();
});

test('cloudcmd: route: no res', (t) => {
    const fn = () => route({});

    t.throws(fn, /res could not be empty!/, 'should throw when no res');
    t.end();
});

test('cloudcmd: route: no next', (t) => {
    const fn = () => route({}, {});

    t.throws(fn, /next should be function!/, 'should throw when no next');
    t.end();
});

test('cloudcmd: route: buttons: no console', (t) => {
    const config = {
        console: false
    };

    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-console none/.test(result), 'should hide console');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: no terminal', (t) => {
    const config = {
        terminal: false
    };

    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-terminal none/.test(result), 'should hide terminal');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: no contact', (t) => {
    const config = {
        contact: false
    };

    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-contact none/.test(result), 'should hide contact');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: no config', (t) => {
    const config = {
        configDialog: false
    };

    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-config none/.test(result), 'should hide config');
                t.end();
                after();
            });
    });
});

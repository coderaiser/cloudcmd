'use strict';

/* global CloudCmd, DOM, io */

require('../../css/config.css');

const rendy = require('rendy/legacy');
const exec = require('execon');
const currify = require('currify/legacy');
const wraptile = require('wraptile/legacy');
const squad = require('squad/legacy');
const {promisify} = require('es6-promisify');
const load = require('load.js');
const createElement = require('@cloudcmd/create-element');

const input = require('../input');
const Images = require('../dom/images');
const Events = require('../dom/events');
const Files = require('../dom/files');

const {getTitle} = require('../../common/cloudfunc');
const {Dialog, setTitle} = DOM;

const Name = 'Config';
CloudCmd[Name] = module.exports;
const alert = currify(Dialog.alert, Name);

const loadSocket = promisify(DOM.loadSocket);

const showLoad = () => {
    Images.show.load('top');
};

const addKey = currify((fn, input) => {
    Events.addKey(input, fn);
    return input;
});

const addChange = currify((fn, input) => {
    Events.add('change', input, fn);
    return input;
});

const Config = {};

let Loading = true;

module.exports.init = async () => {
    if (!CloudCmd.config('configDialog'))
        return;
    
    showLoad();
    
    await CloudCmd.View();
    await loadSocket();
    initSocket();
    Loading = false;
};

const {
    config,
    Key,
} = CloudCmd;

let Element;
let Template;

function getHost() {
    const {
        host,
        origin,
        protocol,
    } = location;
    const href = origin || `${protocol}//${host}`;
    
    return href;
}

function initSocket() {
    const href = getHost();
    const {
        prefixSocket,
        prefix,
    } = CloudCmd;
    
    const ONE_MINUTE = 60 * 1000;
    
    const socket = io.connect(href + prefixSocket + '/config', {
        reconnectionAttempts: Infinity,
        reconnectionDelay: ONE_MINUTE,
        path: prefix + '/socket.io',
    });
    
    const save = (data) => {
        onSave(data);
        socket.send(data);
    };
    
    authCheck(socket);
    
    socket.on('connect', () => {
        Config.save = save;
    });
    
    socket.on('message', onSave);
    socket.on('log', CloudCmd.log);
    
    socket.on('disconnect', () => {
        Config.save = saveHttp;
    });
    
    socket.on('err', alert);
}

function authCheck(socket) {
    socket.emit('auth', config('username'), config('password'));
    socket.on('reject', wraptile(alert, 'Wrong credentials!'));
}

Config.save = saveHttp;

module.exports.show = show;

function show() {
    if (!CloudCmd.config('configDialog'))
        return;
    
    const {prefix} = CloudCmd;
    const funcs = [
        exec.with(Files.get, 'config-tmpl'),
        exec.with(load.css, prefix + '/dist/config.css'),
    ];
    
    if (Loading)
        return;
    
    showLoad();
    exec.parallel(funcs, fillTemplate);
}

function fillTemplate(error, template) {
    if (!Template)
        Template = template;
    
    Files.get('config', (error, config) => {
        if (error)
            return alert('Could not load config!');
        
        const {
            editor,
            packer,
            columns,
            configAuth,
            ...obj
        } = input.convert(config);
        
        obj[editor + '-selected'] = 'selected';
        obj[packer + '-selected'] = 'selected';
        obj[columns + '-selected'] = 'selected';
        obj.configAuth = configAuth ? '' : 'hidden';
        
        const innerHTML = rendy(Template, obj);
        
        Element = createElement('form', {
            className   : 'config',
            innerHTML,
        });
        
        const inputs = document.querySelectorAll('input, select', Element);
        const [inputFirst] = inputs;
        
        let afterShow;
        if (inputFirst) {
            onAuthChange(inputFirst.checked);
            afterShow = inputFirst.focus.bind(inputFirst);
        }
        
        const getTarget = ({target}) => target;
        const handleChange = squad(onChange, getTarget);
        
        [...inputs]
            .map(addKey(onKey))
            .map(addChange(handleChange));
        
        const autoSize = true;
        CloudCmd.View.show(Element, {
            autoSize,
            afterShow,
        });
    });
}

module.exports.hide = hide;

function hide() {
    CloudCmd.View.hide();
}

function onChange(el) {
    const obj = {};
    const name = input.getName(el);
    const data = input.getValue(name, Element);
    
    if (name === 'name')
        onNameChange(data);
    else if (name === 'auth')
        onAuthChange(data);
    
    obj[name] = data;
    
    Config.save(obj);
}

function onSave(obj) {
    Object.keys(obj).forEach((name) => {
        const data = obj[name];
        
        CloudCmd._config(name, data);
        input.setValue(name, data, Element);
    });
}

function saveHttp(obj) {
    const {RESTful} = DOM;
    
    RESTful.Config.write(obj, (error) => {
        if (error)
            return;
        
        onSave(obj);
    });
}

function onAuthChange(checked) {
    const elUsername = input.getElementByName('username', Element);
    const elPassword = input.getElementByName('password', Element);
    
    elUsername.disabled =
    elPassword.disabled = !checked;
}

function onNameChange(name) {
    setTitle(getTitle({
        name,
    }));
}

function onKey({keyCode, target}) {
    switch(keyCode) {
    case Key.ESC:
        return hide();
    
    case Key.ENTER:
        return onChange(target);
    }
}


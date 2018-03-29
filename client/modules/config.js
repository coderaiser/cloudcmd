'use strict';

/* global CloudCmd, DOM, io */

require('../../css/config.css');

const rendy = require('rendy');
const exec = require('execon');
const currify = require('currify/legacy');
const squad = require('squad/legacy');
const input = require('../input');

const Images = require('../dom/images');
const Events = require('../dom/events');
const Files = require('../dom/files');

const {getTitle} = require('../../common/cloudfunc');

const {Dialog, setTitle} = DOM;

const TITLE = 'Config';
const alert = currify(Dialog.alert, TITLE);

const Config = module.exports;

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

CloudCmd.Config = ConfigProto;

let Loading = true;

function ConfigProto() {
    const noop = () => {};
    
    if (!CloudCmd.config('configDialog'))
        return {
            show: noop
        };
    
    Loading = true;
    
    showLoad();
    exec.series([
        CloudCmd.View,
        (callback) => {
            Loading = false;
            exec(callback);
            DOM.loadSocket(initSocket);
        },
        show
    ]);
    
    return module.exports;
}

const config = CloudCmd.config;

const {Key} = CloudCmd;

let Element;
let Template;

function getHost() {
    const {host, origin, protocol} = location;
    const href = origin || `${protocol}//${host}`;
    
    return href;
}

function initSocket() {
    const href = getHost();
    const prefix = CloudCmd.PREFIX;
    const FIVE_SECONDS = 5000;
    
    const socket  = io.connect(href + prefix + '/config', {
        'max reconnection attempts' : Math.pow(2, 32),
        'reconnection limit'        : FIVE_SECONDS,
        path: prefix + '/socket.io'
    });
    
    const save = (data) => {
        onSave(data);
        socket.send(data);
    };
    
    authCheck(socket);
    
    socket.on('connect', () => {
        Config.save = save;
    });
    
    socket.on('config', (config) => {
        DOM.Storage.setAllowed(config.localStorage);
    });
    
    socket.on('message', onSave);
    socket.on('log', CloudCmd.log);
    
    socket.on('disconnect', () => {
        Config.save = saveHttp;
    });
    
    socket.on('err', alert);
}

function authCheck(socket) {
    if (!config('auth'))
        return;
    
    socket.emit('auth', config('username'), config('password'));
    
    socket.on('reject', () => {
        alert('Wrong credentials!');
    });
}

Config.save = saveHttp;

module.exports.show = show;

function show() {
    const prefix = CloudCmd.PREFIX;
    const funcs = [
        exec.with(Files.get, 'config-tmpl'),
        exec.with(DOM.load.parallel, [
            prefix + '/dist/config.css'
        ])
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
        
        const obj = input.convert(config);
        
        obj[obj.editor + '-selected'] = 'selected';
        delete obj.editor;
        
        obj[obj.packer + '-selected'] = 'selected';
        delete obj.packer;
        
        obj[obj.columns + '-selected'] = 'selected';
        delete obj.columns;
        
        const inner = rendy(Template, obj);
        
        Element = DOM.load({
            name        : 'form',
            className   : 'config',
            inner,
            attribute   : {
                'data-name': 'js-config'
            }
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

module.exports.hide = () => {
    CloudCmd.View.hide();
};

function onChange(el) {
    const obj = {};
    const name = input.getName(el);
    const data = input.getValue(name, Element);
    const type = el.type;
    
    if (name === 'name')
        onNameChange(data);
    else if (type === 'checkbox')
        if (/^(diff|buffer|dirStorage)$/.test(name))
            onLSChange(name, data);
        else if (name === 'localStorage')
            onLocalStorageChange();
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
    
    DOM.Storage.setAllowed(obj.localStorage);
}

function saveHttp(obj) {
    const {RESTful} = DOM;
    
    RESTful.Config.write(obj, (error) => {
        if (error)
            return;
        
        onSave(obj);
    });
}

function onLocalStorageChange() {
    const names = ['diff', 'buffer', 'dirStorage', 'localStorage'];
    const elements = names.map((name) => {
        return input.getElementByName(name, Element);
    });
    const el = {};
    const msg = 'Diff, Buffer and Directory Storage do not work without localStorage';
    
    let isChecked;
    
    elements.forEach((element) => {
        const name = input.getName(element);
        
        el[name] = element;
        
        if (element.checked)
            isChecked = true;
    });
    
    if (!isChecked || el.localStorage.checked)
        return;
    
    alert(msg);
    
    elements.forEach((element) => {
        if (!element.checked)
            return;
        
        element.checked = false;
        onChange(element);
    });
}

function onLSChange(name, data) {
    const elLocalStorage = input.getElementByName('localStorage', Element);
    const msg = `${name} depends on localStorage`;
    
    if (!data || elLocalStorage.checked)
        return;
    
    Dialog.alert(TITLE, msg);
    elLocalStorage.checked = true;
}

function onAuthChange(checked) {
    const elUsername = input.getElementByName('username', Element);
    const elPassword = input.getElementByName('password', Element);
    
    elUsername.disabled =
    elPassword.disabled = !checked;
}

function onNameChange(name) {
    setTitle(getTitle({
        name
    }));
}

function onKey({keyCode, target}) {
    switch (keyCode) {
    case Key.ESC:
        Config.hide();
        break;
    
    case Key.ENTER:
        onChange(target);
        break;
    }
}


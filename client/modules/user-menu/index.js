'use strict';

/* global CloudCmd, DOM */

require('../../../css/user-menu.css');

const currify = require('currify/legacy');
const {promisify} = require('es6-promisify');
const load = require('load.js');
const createElement = require('@cloudcmd/create-element');
const tryCatch = require('try-catch');
const tryToCatch = require('try-to-catch/legacy');

const Images = require('../../dom/images');
const Dialog = require('../../dom/dialog');
const getUserMenu = require('./get-user-menu');
const navigate = require('./navigate');

const loadCSS = promisify(load.css);

const Name = 'UserMenu';
CloudCmd[Name] = module.exports;

const {Key} = CloudCmd;

module.exports.init = async () => {
    await Promise.all([
        loadCSS(`${CloudCmd.prefix}/dist/user-menu.css`),
        CloudCmd.View(),
    ]);
};

module.exports.show = show;
module.exports.hide = hide;

const getKey = (a) => a.split(' - ')[0];
const beginWith = (a) => (b) => !b.indexOf(a);

const {CurrentInfo} = DOM;

async function show() {
    Images.show.load('top');
    
    const {dirPath} = CurrentInfo;
    const res = await fetch(`${CloudCmd.prefix}/api/v1/user-menu?dir=${dirPath}`);
    const [error, userMenu] = tryCatch(getUserMenu, await res.text());
    
    if (error)
        return Dialog.alert(`User menu error: ${error.message}`);
    
    const options = Object.keys(userMenu);
    
    const el = createElement('select', {
        className: 'cloudcmd-user-menu',
        innerHTML: fillTemplate(options),
        size: 10,
    });
    
    const keys = options.map(getKey);
    
    el.addEventListener('keydown', onKeyDown(keys, options, userMenu));
    el.addEventListener('dblclick', onDblClick(options, userMenu));
    
    const afterShow = () => el.focus();
    const autoSize = true;
    
    Images.hide();
    
    CloudCmd.View.show(el, {
        autoSize,
        afterShow,
    });
}

function fillTemplate(options) {
    const result = [];
    
    for (const option of options) {
        result.push(`<option>${option}</option>`);
    }
    
    return result.join('');
}

function hide() {
    CloudCmd.View.hide();
}

const onDblClick = currify(async (options, userMenu, e) => {
    const {value} = e.target;
    await runUserMenu(value, options, userMenu);
});

const onKeyDown = currify(async (keys, options, userMenu, e) => {
    const {
        keyCode,
        target,
    } = e;
    
    const key = e.key.toUpperCase();
    
    e.preventDefault();
    e.stopPropagation();
    
    let value;
    
    if (keyCode === Key.ESC)
        return hide();
    else if (keyCode === Key.ENTER)
        ({value} = target);
    else if (keys.includes(key))
        value = options.find(beginWith(key));
    else
        return navigate(target, e);
    
    await runUserMenu(value, options, userMenu);
});

const runUserMenu = async (value, options, userMenu) => {
    hide();
    
    const [e] = await tryToCatch(userMenu[value], {
        DOM,
        CloudCmd,
        tryToCatch,
    });
    
    if (e)
        Dialog.alert(e.stack);
};


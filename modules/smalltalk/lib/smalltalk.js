'use strict';

window.Promise = window.Promise || require('es6-promise');

const currify = require('currify/legacy');
const store = require('fullstore/legacy');
const keyDown = currify(keyDown_);

const remove = bind(removeEl, '.smalltalk');

const BUTTON_OK = ['OK'];
const BUTTON_OK_CANCEL = ['OK', 'Cancel'];

exports.alert = (title, msg) => {
    return showDialog(title, msg, '', BUTTON_OK, {cancel: false});
};

exports.prompt = (title, msg, value = '', options) => {
    const val = String(value).replace(/\"/g, '&quot;');
    const valueStr = `<input type="text" value="${ val }" data-name="js-input">`;
    
    return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
};

exports.confirm = (title, msg, options) => {
    return showDialog(title, msg, '', BUTTON_OK_CANCEL, options);
};

function getTemplate(title, msg, value, buttons) {
    const encodedMsg = msg.replace(/\n/g, '<br>');
    
    return `<div class="page">
        <div data-name="js-close" class="close-button"></div>
        <header>${ title }</header>
        <div class="content-area">
            ${ encodedMsg }
            ${ value }
        </div>
        <div class="action-area">
            <div class="button-strip"> ${
                buttons.map((name, i) =>
                    `<button tabindex=${ i } data-name="js-${ name.toLowerCase() }">${ name }</button>`
                ).join('')
            }
            </div>
        </div>
    </div>`;
}

function showDialog(title, msg, value, buttons, options) {
    const ok = store();
    const cancel = store();
    
    const dialog = document.createElement('div');
    const closeButtons = [
        'cancel',
        'close',
        'ok'
    ];
    
    const promise = new Promise((resolve, reject) => {
        const noCancel = options && !options.cancel;
        const empty = () => {};
        
        ok(resolve);
        cancel(noCancel ? empty : reject);
    });
    
    const tmpl = getTemplate(title, msg, value, buttons);
    
    dialog.innerHTML = tmpl;
    dialog.className = 'smalltalk';
    
    document.body.appendChild(dialog);
    
    find(dialog, ['ok', 'input']).forEach((el) =>
        el.focus()
    );
    
    find(dialog, ['input']).forEach((el) => {
        el.setSelectionRange(0, value.length);
    });
    
    addListenerAll('click', dialog, closeButtons, (event) =>
        closeDialog(event.target, dialog, ok(), cancel())
    );
    
    ['click', 'contextmenu'].forEach((event) =>
        dialog.addEventListener(event, () =>
            find(dialog, ['ok', 'input']).forEach((el) =>
                el.focus()
            )
        )
    );
    
    dialog.addEventListener('keydown', keyDown(dialog, ok(), cancel()));
    
    return promise;
}

function keyDown_(dialog, ok, cancel, event) {
    const KEY   = {
        ENTER : 13,
        ESC   : 27,
        TAB   : 9,
        LEFT  : 37,
        UP    : 38,
        RIGHT : 39,
        DOWN  : 40
    };
    
    const keyCode = event.keyCode;
    const el = event.target;
    
    const namesAll = ['ok', 'cancel', 'input'];
    const names = find(dialog, namesAll)
        .map(getDataName);
    
    switch(keyCode) {
    case KEY.ENTER:
        closeDialog(el, dialog, ok, cancel);
        event.preventDefault();
        break;
    
    case KEY.ESC:
        remove();
        cancel();
        break;
    
    case KEY.TAB:
        if (event.shiftKey)
            tab(dialog, names);
        
        tab(dialog, names);
        event.preventDefault();
        break;
    
    default:
        ['left', 'right', 'up', 'down'].filter((name) => {
            return keyCode === KEY[name.toUpperCase()];
        }).forEach(() => {
            changeButtonFocus(dialog, names);
        });
        
        break;
    }
    
    event.stopPropagation();
}

function getDataName(el) {
    return el
        .getAttribute('data-name')
        .replace('js-', '');
}

function changeButtonFocus(dialog, names) {
    const active = document.activeElement;
    const activeName = getDataName(active);
    const isButton = /ok|cancel/.test(activeName);
    const count = names.length - 1;
    const getName = (activeName) => {
        if (activeName === 'cancel')
            return 'ok';
        
        return 'cancel';
    };
    
    if (activeName === 'input' || !count || !isButton)
        return;
    
    const name = getName(activeName);
    
    find(dialog, [name]).forEach((el) => {
        el.focus();
    });
}

const getIndex = (count, index) => {
    if (index === count)
        return 0;
    
    if (index < count)
        return index + 1;
};

function tab(dialog, names) {
    const active = document.activeElement;
    const activeName = getDataName(active);
    const count = names.length - 1;
    
    const activeIndex = names.indexOf(activeName);
    const index = getIndex(count, activeIndex);
    
    const name = names[index];
    
    find(dialog, [name]).forEach((el) =>
        el.focus()
    );
}

function closeDialog(el, dialog, ok, cancel) {
    const name = el
        .getAttribute('data-name')
        .replace('js-', '');
    
    if (/close|cancel/.test(name)) {
        cancel();
        remove();
        return;
    }
    
    const value = find(dialog, ['input'])
        .reduce((value, el) => el.value, null);
    
    ok(value);
    remove();
}

function find(element, names) {
    const notEmpty = (a) => a;
    const elements = names.map((name) =>
        element.querySelector(`[data-name="js-${ name }"]`)
    ).filter(notEmpty);
    
    return elements;
}

function addListenerAll(event, parent, elements, fn) {
    find(parent, elements)
        .forEach((el) =>
            el.addEventListener(event, fn)
        );
}

function removeEl(name) {
     const el = document.querySelector(name);
     
     el.parentElement.removeChild(el);
}

function bind(fn, ...args) {
    return () => fn(...args);
}


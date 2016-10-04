'use strict';

const remove            = bind(removeEl, '.smalltalk');

const BUTTON_OK         = ['OK'];
const BUTTON_OK_CANCEL  = ['OK', 'Cancel'];
    
exports.alert = (title, msg) => {
    return showDialog(title, msg, '', BUTTON_OK, {cancel: false});
};

exports.prompt = (title, msg, value, options) => {
    const val         = value || '';
    const valueStr    = `<input type="text" value="${ val }" data-name="js-input">`;
    
    return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
};

exports.confirm = (title, msg, options) => {
    return showDialog(title, msg, '', BUTTON_OK_CANCEL, options);
};

function getTemplate(title, msg, value, buttons) {
    if (!Array.isArray(buttons))
        throw Error('buttons should be array!');
    
    return `<div class="page">
        <div data-name="js-close" class="close-button"></div>
        <header>${ title }</header>
        <div class="content-area">
            ${ msg }
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
    let ok, cancel;
    
    const dialog  = document.createElement('div');
    const closeButtons    = [
        'cancel',
        'close',
        'ok'
    ];
    
    const promise = new Promise((resolve, reject) => {
        const noCancel    = options && !options.cancel;
        const empty       = () => {};
        
        ok      = resolve;
        cancel  = noCancel ? empty : reject;
    });
    
    const tmpl    = getTemplate(title, msg, value, buttons);
    
    dialog.innerHTML = tmpl;
    dialog.className = 'smalltalk';
    
    document.body.appendChild(dialog);
    
    find(dialog, ['ok', 'input']).forEach(el =>
        el.focus()
    );
    
    find(dialog, ['input']).forEach(el => {
        el.setSelectionRange(0, value.length);
    });
    
    addListenerAll('click', dialog, closeButtons, event =>
        closeDialog(event.target, dialog, ok, cancel)
    );
    
    ['click', 'contextmenu'].forEach(event =>
        dialog.addEventListener(event, () =>
            find(dialog, ['ok', 'input']).forEach(el =>
                el.focus()
            )
        )
    );
    
    dialog.addEventListener('keydown', keyDown(dialog, ok, cancel));
    
    return promise;
}

function keyDown(dialog, ok, cancel) {
    return event => {
        const KEY   = {
            ENTER : 13,
            ESC   : 27,
            TAB   : 9,
            LEFT  : 37,
            UP    : 38,
            RIGHT : 39,
            DOWN  : 40
        };
        
        const keyCode     = event.keyCode;
        const el          = event.target;
        
        const namesAll    = ['ok', 'cancel', 'input'];
        const names       = find(dialog, namesAll).map((el) => {
            return getDataName(el);
        });
        
        let is;
        
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
            is = ['left', 'right', 'up', 'down'].some((name) => {
                return keyCode === KEY[name.toUpperCase()];
            });
            
            if (is)
                changeButtonFocus(dialog, names);
            
            break;
        }
        
        event.stopPropagation();
    };
}

function getDataName(el) {
    return el
        .getAttribute('data-name')
        .replace('js-', '');
}

function changeButtonFocus(dialog, names) {
    let name        = '';
    const active    = document.activeElement,
        activeName  = getDataName(active),
        isButton    = /ok|cancel/.test(activeName),
        count       = names.length - 1;
    
    if (activeName !== 'input' && count && isButton) {
        if (activeName === 'cancel')
            name = 'ok';
        else
            name = 'cancel';
            
        find(dialog, [name]).forEach(el => {
            el.focus();
        });
    }
}

function tab(dialog, names) {
    const active    = document.activeElement,
        activeName  = getDataName(active),
        
        count       = names.length - 1;
    let index       = names.indexOf(activeName);
    
    if (index === count)
        index = 0;
    else if (index < count)
        ++index;
    
    const name = names[index];
    
    find(dialog, [name]).forEach(el =>
        el.focus()
    );
}

function closeDialog(el, dialog, ok, cancel) {
    let value;
    const name = el
            .getAttribute('data-name')
            .replace('js-', '');
    
    if (/close|cancel/.test(name)) {
        cancel();
    } else {
        value = find(dialog, ['input']).reduce((value, el) => {
            return el.value;
        }, null);
        
        ok(value);
    }
    
    remove();
}

function find(element, names) {
    const elements = names.map(name =>
        element.querySelector(`[data-name="js-${ name }"]`)
    ).filter(el =>
        el
    );
    
    return elements;
}

function addListenerAll(event, parent, elements, fn) {
    find(parent, elements).forEach(el =>
        el.addEventListener(event, fn)
    );
}

function removeEl(name) {
    var el = document.querySelector(name);
    
    el.parentElement.removeChild(el);
}

function bind(fn, ...args) {
    return () => fn(...args);
}


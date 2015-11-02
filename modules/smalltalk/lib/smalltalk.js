(function (global) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) module.exports = SmallTalk();else global.smalltalk = SmallTalk();

    function SmallTalk(callback) {
        if (!(this instanceof SmallTalk)) return new SmallTalk(callback);

        var remove = bind(removeEl, '.smalltalk');

        var BUTTON_OK = ['OK'];
        var BUTTON_OK_CANCEL = ['OK', 'Cancel'];

        this.alert = function (title, msg, options) {
            return showDialog(title, msg, '', BUTTON_OK, options);
        };

        this.prompt = function (title, msg, value, options) {
            var val = value || '';
            var valueStr = '<br><input type="text" value="' + val + '" data-name="js-input">';

            return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
        };

        this.confirm = function (title, msg, options) {
            return showDialog(title, msg, '', BUTTON_OK_CANCEL, options);
        };

        function getTemplate(title, msg, value, buttons) {
            if (!Array.isArray(buttons)) throw Error('buttons should be array!');

            return '<div class="page">\n                <div data-name="js-close" class="close-button"></div>\n                <header>' + title + '</header>\n                <div class="content-area">\n                    ' + msg + '\n                    ' + value + '\n                </div>\n                <div class="action-area">\n                    <div class="button-strip"> ' + buttons.map(function (name, i) {
                return '<button tabindex=' + i + ' data-name="js-' + name.toLowerCase() + '">' + name + '</button>';
            }).join('') + '\n                    </div>\n                </div>\n            </div>';
        }

        function showDialog(title, msg, value, buttons, options) {
            var dialog = document.createElement('div'),
                closeButtons = ['cancel', 'close', 'ok'],
                ok = undefined,
                cancel = undefined,
                promise = new Promise(function (resolve, reject) {
                var noCancel = options && !options.cancel;
                var empty = function empty() {};

                ok = resolve;
                cancel = reject;

                if (noCancel) cancel = empty;
            }),
                tmpl = getTemplate(title, msg, value, buttons);

            dialog.innerHTML = tmpl;
            dialog.className = 'smalltalk';

            document.body.appendChild(dialog);

            find(dialog, ['ok', 'input']).forEach(function (el) {
                return el.focus();
            });

            find(dialog, ['input']).forEach(function (el) {
                el.setSelectionRange(0, value.length);
            });

            addListeterAll('click', dialog, closeButtons, function (event) {
                return closeDialog(event.target, dialog, ok, cancel);
            });

            ['click', 'contextmenu'].forEach(function (event) {
                return dialog.addEventListener(event, function () {
                    return find(dialog, ['ok', 'input']).forEach(function (el) {
                        return el.focus();
                    });
                });
            });

            dialog.addEventListener('keydown', keyDown(dialog, ok, cancel));

            return promise;
        }

        function keyDown(dialog, ok, cancel) {
            return function (event) {
                var KEY = {
                    ENTER: 13,
                    ESC: 27,
                    TAB: 9,
                    LEFT: 37,
                    UP: 38,
                    RIGHT: 39,
                    DOWN: 40
                };

                var keyCode = event.keyCode,
                    el = event.target;

                var namesAll = ['ok', 'cancel', 'input'],
                    names = find(dialog, namesAll).map(function (el) {
                    return getDataName(el);
                });

                switch (keyCode) {
                    case KEY.ENTER:
                        closeDialog(el, dialog, ok, cancel);
                        event.preventDefault();
                        break;

                    case KEY.ESC:
                        remove();
                        cancel();
                        break;

                    case KEY.TAB:
                        if (event.shiftKey) tab(dialog, names);

                        tab(dialog, names);
                        event.preventDefault();
                        break;

                    default:
                        var is = ['left', 'right', 'up', 'down'].some(function (name) {
                            return keyCode === KEY[name.toUpperCase()];
                        });

                        if (is) changeButtonFocus(dialog, names);

                        break;
                }

                event.stopPropagation();
            };
        }

        function getDataName(el) {
            return el.getAttribute('data-name').replace('js-', '');
        }

        function changeButtonFocus(dialog, names) {
            var name = '',
                active = document.activeElement,
                activeName = getDataName(active),
                isButton = /ok|cancel/.test(activeName),
                count = names.length - 1;

            if (activeName !== 'input' && count && isButton) {
                if (activeName === 'cancel') name = 'ok';else name = 'cancel';

                find(dialog, [name]).forEach(function (el) {
                    return el.focus();
                });
            }
        }

        function tab(dialog, names) {
            var active = document.activeElement,
                activeName = getDataName(active),
                count = names.length - 1,
                index = names.indexOf(activeName);

            if (index === count) index = 0;else if (index < count) ++index;

            var name = names[index];

            find(dialog, [name]).forEach(function (el) {
                return el.focus();
            });
        }

        function closeDialog(el, dialog, ok, cancel) {
            var value = undefined,
                name = el.getAttribute('data-name').replace('js-', '');

            if (/close|cancel/.test(name)) {
                cancel();
            } else {
                value = find(dialog, ['input']).reduce(function (value, el) {
                    return el.value;
                }, null);

                ok(value);
            }

            remove();
        }

        function find(element, names) {
            var elements = names.map(function (name) {
                return element.querySelector('[data-name="js-' + name + '"]');
            }).filter(function (el) {
                return el;
            });

            return elements;
        }

        function addListeterAll(event, parent, elements, fn) {
            find(parent, elements).forEach(function (el) {
                return el.addEventListener(event, fn);
            });
        }

        function removeEl(name) {
            var el = document.querySelector(name);

            el.parentElement.removeChild(el);
        }

        function bind(fn) {
            var args = [].slice.call(arguments, 1);

            return fn.bind(null, args);
        }
    }
})(typeof window !== 'undefined' && window);
'use strict';

const tryToCatch = require('try-to-catch/legacy');

const {
    alert,
    prompt,
    confirm,
    progress,
} = require('smalltalk');

const title = 'Cloud Commander';

module.exports.alert = (...a) => alert(title, ...a, {
    cancel: false,
});

module.exports.prompt = (...a) => tryToCatch(prompt, title, ...a);
module.exports.confirm = (...a) => tryToCatch(confirm, title, ...a);
module.exports.progress = (...a) => progress(title, ...a);

module.exports.alert.noFiles = () => {
    return alert(title, 'No files selected!', {
        cancel: false,
    });
};


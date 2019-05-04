
'use strict';

const {
    alert,
    prompt,
    confirm,
    progress,
}= require('smalltalk');

const title = 'Cloud Commander';

module.exports.alert = (...a) => alert(title, ...a);
module.exports.prompt = (...a) => prompt(title, ...a);
module.exports.confirm = (...a) => confirm(title, ...a);
module.exports.progress = (...a) => progress(title, ...a);

module.exports.alert.noFiles = () => {
    return alert(title, 'No files selected!', {
        cancel: false,
    });
};


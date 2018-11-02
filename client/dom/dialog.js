
'use strict';

const {
    alert,
    prompt,
    confirm,
}= require('smalltalk');

module.exports = {
    alert,
    prompt,
    confirm,
};

module.exports.alert.noFiles = (title) => {
    return alert(title, 'No files selected!', {
        cancel: false,
    });
};


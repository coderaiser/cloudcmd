import tryToCatch from 'try-to-catch';

import {alert, prompt, confirm, progress} from 'smalltalk';

const title = 'Cloud Commander';

const customAlert = (...a) => alert(title, ...a, {
    cancel: false,
});

customAlert.noFiles = () => {
    return alert(title, 'No files selected!', {
        cancel: false,
    });
};

const customPrompt = (...a) => tryToCatch(prompt, title, ...a);
const customConfirm = (...a) => tryToCatch(confirm, title, ...a);
const customProgress = (...a) => progress(title, ...a);
export {
    customAlert as alert,
    customPrompt as prompt,
    customConfirm as confirm,
    customProgress as progress,
}

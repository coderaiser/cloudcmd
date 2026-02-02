import {tryToCatch} from 'try-to-catch';
import * as smalltalk from 'smalltalk';

const title = 'Cloud Commander';

export const alert = (...a) => smalltalk.alert(title, ...a, {
    cancel: false,
});

export const prompt = (...a) => tryToCatch(smalltalk.prompt, title, ...a);
export const confirm = (...a) => tryToCatch(smalltalk.confirm, title, ...a);
export const progress = (...a) => smalltalk.progress(title, ...a);

alert.noFiles = () => {
    return smalltalk.alert(title, 'No files selected!', {
        cancel: false,
    });
};

import {render} from './render.js';
import {attachForm} from './form/form.js';

const noop = () => {};
const {CloudCmd} = globalThis;

CloudCmd.ConfigPutout = {
    init: noop,
    render,
    attach: attachForm,
};

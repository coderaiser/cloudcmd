import {render} from './render.js';

const noop = () => {};
const {CloudCmd} = globalThis;

CloudCmd.ConfigPutout = {
    init: noop,
    render,
};

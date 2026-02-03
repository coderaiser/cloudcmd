import {merge} from 'webpack-merge';
import * as htmlConfig from './.webpack/html.js';
import cssConfig from './.webpack/css.js';
import jsConfig from './.webpack/js.js';

export default merge([
    jsConfig,
    htmlConfig,
    cssConfig,
]);

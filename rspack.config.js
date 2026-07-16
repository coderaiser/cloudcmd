import {merge} from 'webpack-merge';
import * as htmlConfig from './.rspack/html.js';
import cssConfig from './.rspack/css.js';
import jsConfig from './.rspack/js.js';

export default merge([
    jsConfig,
    htmlConfig,
    cssConfig,
]);

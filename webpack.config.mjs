import {merge} from 'webpack-merge';
import * as htmlConfig from './.webpack/html.mjs';
import cssConfig from './.webpack/css.mjs';
import jsConfig from './.webpack/js.mjs';

export default merge([
    jsConfig,
    htmlConfig,
    cssConfig,
]);

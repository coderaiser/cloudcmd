import {merge} from 'webpack-merge';
import cssConfig from './.rspack/css.js';
import jsConfig from './.rspack/js.js';

export default merge([jsConfig, cssConfig]);

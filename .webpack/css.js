'use strict';

const {env} = require('node:process');
const fs = require('node:fs');
const {
    basename,
    extname,
    join,
} = require('node:path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDev = env.NODE_ENV === 'development';

const extractCSS = (a) => new ExtractTextPlugin(`${a}.css`);
const extractMain = extractCSS('[name]');

const cssNames = [
    'nojs',
    'view',
    'config',
    'terminal',
    'user-menu',
    ...getCSSList('columns'),
    ...getCSSList('themes'),
];

const cssPlugins = cssNames.map(extractCSS);
const clean = (a) => a.filter(Boolean);

const plugins = clean([
    ...cssPlugins,
    extractMain,
    !isDev && new OptimizeCssAssetsPlugin(),
]);

const rules = [{
    test: /\.css$/,
    exclude: /css\/(nojs|view|config|terminal|user-menu|columns.*|themes.*)\.css/,
    use: extractMain.extract(['css-loader']),
}, ...cssPlugins.map(extract), {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    use: {
        loader: 'url-loader',
        options: {
            limit: 100_000,
        },
    },
}];

module.exports = {
    plugins,
    module: {
        rules,
    },
};

function getCSSList(dir) {
    const base = (a) => basename(a, extname(a));
    const addDir = (name) => `${dir}/${name}`;
    const rootDir = join(__dirname, '..');
    
    return fs
        .readdirSync(`${rootDir}/css/${dir}`)
        .map(base)
        .map(addDir);
}

function extract(extractPlugin) {
    const {filename} = extractPlugin;
    
    return {
        test: RegExp(`css/${filename}`),
        use: extractPlugin.extract(['css-loader']),
    };
}

'use strict';

const fs = require('fs');
const {
    basename,
    extname,
    join,
} = require('path');

const {env} = process;
const isDev = env.NODE_ENV === 'development';

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const extractCSS = (a) => new ExtractTextPlugin(`${a}.css`);
const extractMain = extractCSS('[name]');

const cssNames = [
    'nojs',
    'view',
    'config',
    'terminal',
    'user-menu',
    ...getCSSList('columns'),
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
    exclude: /css\/(nojs|view|config|terminal|user-menu|columns.*)\.css/,
    use: extractMain.extract([
        'css-loader',
    ]),
},
...cssPlugins.map(extract), {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    use: {
        loader: 'url-loader',
        options: {
            limit: 100000,
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
    
    return fs.readdirSync(`${rootDir}/css/${dir}`)
        .map(base)
        .map(addDir);
}

function extract(extractPlugin) {
    const {filename} = extractPlugin;
    
    return {
        test: RegExp(`css/${filename}`),
        use: extractPlugin.extract([
            'css-loader',
        ]),
    };
}


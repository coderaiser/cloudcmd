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

const extractCSS = (a) => new ExtractTextPlugin(`${a}.css`);
const extractMain = extractCSS('[name]');

const cssNames = [
    'nojs',
    'view',
    'config',
    'terminal',
    ...getCSSList('columns'),
];

const cssPlugins = cssNames.map(extractCSS);

const plugins = [
    ...cssPlugins,
    extractMain,
];

const cssLoader = isDev ? 'css-loader' : 'css-loader?minimize';

const rules = [{
    test: /\.css$/,
    exclude: /css\/(nojs|view|config|terminal|columns.*)\.css/,
    use: extractMain.extract([
        cssLoader,
    ]),
},
...cssPlugins.map(extract), {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    loader: 'url-loader?limit=50000',
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
            cssLoader
        ])
    };
}


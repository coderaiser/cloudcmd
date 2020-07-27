'use strict';

const fs = require('fs');
const {
    basename,
    extname,
    join,
} = require('path');

const {env} = process;
const isDev = env.NODE_ENV === 'development';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const extractCSS = (a) => new MiniCssExtractPlugin({
    filename: `${a}.css`
});

const extractMain = extractCSS('[name]');

const cssBase = [
    'nojs',
    'view',
    'config',
    'terminal',
    'user-menu',
];

const cssNames = [
    ...cssBase,
    ...getCSSList('columns'),
];

const cssRules = cssNames.map(extract);
const cssPlugins = cssBase.map(extractCSS);
const clean = (a) => a.filter(Boolean);

const plugins = clean([
    ...cssPlugins,
    extractMain,
    !isDev && new OptimizeCssAssetsPlugin(),
]);

const rules = [{
    test: /\.css$/,
    exclude: /css\/(nojs|view|config|terminal|user-menu|columns.*)\.css/,
    use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
    ],
},
...cssRules, {
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

function extract(filename) {
    return {
        test: RegExp(`css/${filename}`),
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
        ],
    };
}


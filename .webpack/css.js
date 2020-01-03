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
    filename: `${a}.css`,
});

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
    new MiniCssExtractPlugin(),
    !isDev && new OptimizeCssAssetsPlugin(),
]);

const rules = [{
    test: /\.css$/,
    exclude: /css\/(nojs|view|config|terminal|user-menu|columns.*)\.css/,
    use: [MiniCssExtractPlugin.loader, 'css-loader'],
},
    ...cssNames.map(extract), {
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
    console.log(':->', filename);
    return {
        test: RegExp(`css/${filename}`),
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
    };
}


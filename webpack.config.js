'use strict';

const fs = require('fs');
const {
    resolve,
    basename,
    extname,
    sep,
} = require('path');

const dir = './client';
const dirModules = './client/modules';
const modules = './modules';

const {env} = process;
const isDev = env.NODE_ENV === 'development';

const dist = resolve(__dirname, 'dist');
const distDev = resolve(__dirname, 'dist-dev');
const devtool = isDev ? 'eval' : 'source-map';

const notEmpty = (a) => a;
const clean = (array) => array.filter(notEmpty);

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCSS = (a) => new ExtractTextPlugin(`${a}.css`);
const extractMain = extractCSS('[name]');

const cssNames = [
    'nojs',
    'view',
    'config',
    ...getCSSList('columns'),
];

const cssPlugins = cssNames.map(extractCSS);

const plugins = [
    new HtmlWebpackPlugin({
        inject: false,
        template: 'html/index.html',
        minify: !isDev && getMinifyHtmlOptions(),
    }),
    ...cssPlugins,
    extractMain,
];

const rules = clean([
    !isDev && {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
    }, {
        test: /\.css$/,
        exclude: /css\/(nojs|view|config|columns.*)\.css/,
        use: extractMain.extract([
            'css-loader?minimize',
        ]),
    },
    ...cssPlugins.map(extract),
    {
        test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
        loader: 'url-loader?limit=50000',
    },
]);

const splitChunks = {
    chunks: 'all',
    name: 'cloudcmd.common',
};

module.exports = {
    devtool,
    optimization: {
        splitChunks,
    },
    entry: {
        cloudcmd: `${dir}/cloudcmd.js`,
        [modules + '/edit']: `${dirModules}/edit.js`,
        [modules + '/edit-file']: `${dirModules}/edit-file.js`,
        [modules + '/edit-file-vim']: `${dirModules}/edit-file-vim.js`,
        [modules + '/edit-names']: `${dirModules}/edit-names.js`,
        [modules + '/menu']: `${dirModules}/menu.js`,
        [modules + '/view']: `${dirModules}/view.js`,
        [modules + '/help']: `${dirModules}/help.js`,
        [modules + '/markdown']: `${dirModules}/markdown.js`,
        [modules + '/config']: `${dirModules}/config.js`,
        [modules + '/contact']: `${dirModules}/contact.js`,
        [modules + '/upload']: `${dirModules}/upload.js`,
        [modules + '/operation']: `${dirModules}/operation/index.js`,
        [modules + '/konsole']: `${dirModules}/konsole.js`,
        [modules + '/terminal']: `${dirModules}/terminal.js`,
        [modules + '/cloud']: `${dirModules}/cloud.js`,
        [modules + '/polyfill']: `${dirModules}/polyfill.js`,
    },
    output: {
        filename: '[name].js',
        path: isDev ? distDev : dist,
        pathinfo: isDev,
        devtoolModuleFilenameTemplate,
    },
    plugins,
    externals: [
        externals
    ],
    module: {
        rules,
    },
};

function getCSSList(dir) {
    const base = (a) => basename(a, extname(a));
    const addDir = (name) => `${dir}/${name}`;
    
    return fs.readdirSync(`./css/${dir}`)
        .map(base)
        .map(addDir);
}

function externals(context, request, fn) {
    if (!isDev)
        return fn();
    
    const list = [
        'es6-promise',
    ];
    
    if (list.includes(request))
        return fn(null, request);
    
    fn();
}

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(__dirname + sep, '');
    return `file://cloudcmd/${resource}`;
}

function extract(extractPlugin) {
    const {filename} = extractPlugin;
    const loader = isDev ? 'css-loader' : 'css-loader?minimize';
    
    return {
        test: RegExp(`css/${filename}`),
        use: extractPlugin.extract([
            loader
        ])
    };
}

function getMinifyHtmlOptions() {
    return {
        removeComments:                 true,
        removeCommentsFromCDATA:        true,
        removeCDATASectionsFromCDATA:   true,
        collapseWhitespace:             true,
        collapseBooleanAttributes:      true,
        removeAttributeQuotes:          true,
        removeRedundantAttributes:      true,
        useShortDoctype:                true,
        removeEmptyAttributes:          true,
        /* оставляем, поскольку у нас
         * в элемент fm генерируеться
         * таблица файлов
         */
        removeEmptyElements:            false,
        removeOptionalTags:             true,
        removeScriptTypeAttributes:     true,
        removeStyleLinkTypeAttributes:  true,
        
        minifyJS:                       true,
        minifyCSS:                     false, 
    };
}


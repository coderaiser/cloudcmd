'use strict';

const {
    resolve,
    sep,
    join,
} = require('path');

const {
    EnvironmentPlugin,
} = require('webpack');

const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

const dir = './client';
const dirModules = './client/modules';
const modules = './modules';

const {env} = process;
const isDev = env.NODE_ENV === 'development';

const rootDir = join(__dirname, '..');
const dist = resolve(rootDir, 'dist');
const distDev = resolve(rootDir, 'dist-dev');
const devtool = isDev ? 'eval' : 'source-map';

const notEmpty = (a) => a;
const clean = (array) => array.filter(notEmpty);

const babelDev = {
    babelrc: false,
    plugins: [
        'babel-plugin-macros',
    ]
};

const rules = clean([
    !isDev && {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
    },
    isDev && {
        test: /sw.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: babelDev
    }]);

const plugins = [
    new EnvironmentPlugin(['NODE_ENV']),
    new ServiceWorkerWebpackPlugin({
        entry: join(__dirname, '..', 'client', 'sw', 'sw.js'),
    }),
];

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
        //[sw]: `${dir}/sw.js`,
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
        publicPath: '/dist/',
    },
    externals: [
        externals
    ],
    module: {
        rules,
    },
    plugins,
};

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
    const resource = info.absoluteResourcePath.replace(rootDir + sep, '');
    return `file://cloudcmd/${resource}`;
}


'use strict';

const {
    resolve,
    sep,
    join,
} = require('path');

const {EnvironmentPlugin} = require('webpack');
const WebpackBar = require('webpackbar');

const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

const dir = './client';
const dirModules = './client/modules';
const modules = './modules';

const {env} = process;
const {NODE_ENV} = env;
const isDev = NODE_ENV === 'development';

const rootDir = join(__dirname, '..');
const dist = resolve(rootDir, 'dist');
const distDev = resolve(rootDir, 'dist-dev');
const devtool = isDev ? 'eval' : 'source-map';

const notEmpty = (a) => a;
const clean = (array) => array.filter(notEmpty);

const noParse = (a) => /\.spec\.js$/.test(a);

const options = {
    babelrc: true,
};

const rules = clean([
    !isDev && {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
    },
    isDev && {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options,
    }]);

const plugins = [
    new EnvironmentPlugin({
        NODE_ENV,
    }),
    
    new ServiceWorkerWebpackPlugin({
        entry: join(__dirname, '..', 'client', 'sw', 'sw.js'),
        excludes: ['*'],
    }),
    
    new WebpackBar(),
];

const splitChunks = {
    name: 'cloudcmd.common',
    chunks: 'all',
};

module.exports = {
    resolve: {
        symlinks: false,
    },
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
        [modules + '/edit-names-vim']: `${dirModules}/edit-names-vim.js`,
        [modules + '/menu']: `${dirModules}/menu.js`,
        [modules + '/view']: `${dirModules}/view/index.js`,
        [modules + '/help']: `${dirModules}/help.js`,
        [modules + '/markdown']: `${dirModules}/markdown.js`,
        [modules + '/config']: `${dirModules}/config/index.js`,
        [modules + '/contact']: `${dirModules}/contact.js`,
        [modules + '/upload']: `${dirModules}/upload.js`,
        [modules + '/operation']: `${dirModules}/operation/index.js`,
        [modules + '/konsole']: `${dirModules}/konsole.js`,
        [modules + '/terminal']: `${dirModules}/terminal.js`,
        [modules + '/terminal-run']: `${dirModules}/terminal-run.js`,
        [modules + '/cloud']: `${dirModules}/cloud.js`,
        [modules + '/user-menu']: `${dirModules}/user-menu/index.js`,
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
        externals,
    ],
    module: {
        rules,
        noParse,
    },
    plugins,
    performance: {
        maxEntrypointSize: 600_000,
        maxAssetSize: 600_000,
    },
};

function externals(context, request, fn) {
    if (!isDev)
        return fn();
    
    const list = [];
    
    if (list.includes(request))
        return fn(null, request);
    
    fn();
}

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(rootDir + sep, '');
    return `file://cloudcmd/${resource}`;
}


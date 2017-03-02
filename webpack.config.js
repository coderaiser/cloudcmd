'use strict';

const path = require('path');
const webpack = require('webpack');
const {optimize} = webpack;
const {UglifyJsPlugin} = optimize;

const dir = './client';
const dirModules = './client/modules';
const modules = './modules';

const {env} = process;
const isDev = env.NODE_ENV === 'development';

const dist = path.resolve(__dirname, 'dist');
const distDev = path.resolve(__dirname, 'dist-dev');
const devtool = isDev ? 'eval' : 'source-map';
const notEmpty = (a) => a;
const clean = (array) => array.filter(notEmpty);

const plugins = clean([
    !isDev && new UglifyJsPlugin({
        sourceMap: true,
        comments: false,
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'cloudcmd',
        filename: 'cloudcmd.js',
    }),
]);
const loaders = clean([
    !isDev && {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
            presets: ['es2015']
        }
    }
]);

module.exports = {
    devtool,
    entry: {
        cloudcmd: `${dir}/cloudcmd.js`,
        [modules + '/edit']: `${dirModules}/edit.js`,
        [modules + '/edit-file']: `${dirModules}/edit-file.js`,
        [modules + '/edit-names']: `${dirModules}/edit-names.js`,
        [modules + '/menu']: `${dirModules}/menu.js`,
        [modules + '/view']: `${dirModules}/view.js`,
        [modules + '/help']: `${dirModules}/help.js`,
        [modules + '/markdown']: `${dirModules}/markdown.js`,
        [modules + '/config']: `${dirModules}/config.js`,
        [modules + '/contact']: `${dirModules}/contact.js`,
        [modules + '/upload']: `${dirModules}/upload.js`,
        [modules + '/operation']: `${dirModules}/operation.js`,
        [modules + '/konsole']: `${dirModules}/konsole.js`,
        [modules + '/cloud']: `${dirModules}/cloud.js`,
        [modules + '/polyfill']: `${dirModules}/polyfill.js`,
    },
    output: {
        filename: '[name].js',
        path: isDev ? distDev : dist,
        libraryTarget: 'umd'
    },
    plugins,
    externals: [
        externals
    ],
    module: {
        loaders,
    },
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


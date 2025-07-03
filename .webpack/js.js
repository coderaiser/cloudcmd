'use strict';

const {
    resolve,
    sep,
    join,
} = require('node:path');

const {env} = require('node:process');
const {
    EnvironmentPlugin,
    NormalModuleReplacementPlugin,
} = require('webpack');
const WebpackBar = require('webpackbar');

const modules = './modules';
const dirModules = './client/modules';
const dirCss = './css';
const dirThemes = `${dirCss}/themes`;
const dirColumns = `${dirCss}/columns`;
const dir = './client';
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
    },
]);

const plugins = [
    new NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
    }),
    new EnvironmentPlugin({
        NODE_ENV,
    }),
    new WebpackBar(),
];

const splitChunks = {
    chunks: 'all',
    cacheGroups: {
        abcCommon: {
            name: 'cloudcmd.common',
            chunks: (chunk) => {
                const lazyChunks = [
                    'nojs',
                    'view',
                    'edit',
                    'terminal',
                    'config',
                    'user-menu',
                    'help',
                    'themes/dark',
                    'themes/light',
                    'columns/name-size',
                    'columns/name-size-date',
                ];

                return !lazyChunks.includes(chunk.name);
            },
            minChunks: 1,
            enforce: true,
            priority: -1,
            reuseExistingChunk: true,
        },
    },
};

module.exports = {
    resolve: {
        symlinks: false,
        alias: {
            'node:process': 'process',
            'node:path': 'path',
        },
        fallback: {
            'path': require.resolve('path-browserify'),
            'process': require.resolve('process/browser'),
        },
    },
    devtool,
    optimization: {
        splitChunks,
    },
    entry: {
        'themes/dark': `${dirThemes}/dark.css`,
        'themes/light': `${dirThemes}/light.css`,
        'columns/name-size': `${dirColumns}/name-size.css`,
        'columns/name-size-date': `${dirColumns}/name-size-date.css`,
        'nojs': `${dirCss}/nojs.css`,
        help: `${dirCss}/help.css`,
        view: `${dirCss}/view.css`,
        config: `${dirCss}/config.css`,
        terminal: `${dirCss}/terminal.css`,
        'user-menu': `${dirCss}/user-menu.css`,
        sw: `${dir}/sw/sw.js`,
        cloudcmd: `${dir}/cloudcmd.js`,
        [`${modules}/edit`]: `${dirModules}/edit.js`,
        [`${modules}/edit-file`]: `${dirModules}/edit-file.js`,
        [`${modules}/edit-file-vim`]: `${dirModules}/edit-file-vim.js`,
        [`${modules}/edit-names`]: `${dirModules}/edit-names.js`,
        [`${modules}/edit-names-vim`]: `${dirModules}/edit-names-vim.js`,
        [`${modules}/menu`]: `${dirModules}/menu.js`,
        [`${modules}/view`]: `${dirModules}/view/index.js`,
        [`${modules}/help`]: `${dirModules}/help.js`,
        [`${modules}/markdown`]: `${dirModules}/markdown.js`,
        [`${modules}/config`]: `${dirModules}/config/index.js`,
        [`${modules}/contact`]: `${dirModules}/contact.js`,
        [`${modules}/upload`]: `${dirModules}/upload.js`,
        [`${modules}/operation`]: `${dirModules}/operation/index.js`,
        [`${modules}/konsole`]: `${dirModules}/konsole.js`,
        [`${modules}/terminal`]: `${dirModules}/terminal.js`,
        [`${modules}/terminal-run`]: `${dirModules}/terminal-run.js`,
        [`${modules}/cloud`]: `${dirModules}/cloud.js`,
        [`${modules}/user-menu`]: `${dirModules}/user-menu/index.js`,
        [`${modules}/polyfill`]: `${dirModules}/polyfill.js`,
        [`${modules}/command-line`]: `${dirModules}/command-line.js`,
    },
    output: {
        filename: '[name].js',
        path: isDev ? distDev : dist,
        pathinfo: isDev,
        devtoolModuleFilenameTemplate,
        publicPath: '/dist/',
    },
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

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(rootDir + sep, '');
    return `file://cloudcmd/${resource}`;
}

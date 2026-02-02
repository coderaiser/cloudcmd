import {resolve, sep} from 'node:path';
import {env} from 'node:process';
import webpack from 'webpack';
import WebpackBar from 'webpackbar';

const {
    EnvironmentPlugin,
    NormalModuleReplacementPlugin,
} = webpack;

const modules = './modules';
const dirModules = './client/modules';
const dirCss = './css';
const dirThemes = `${dirCss}/themes`;
const dirColumns = `${dirCss}/columns`;
const dir = './client';
const {NODE_ENV} = env;
const isDev = NODE_ENV === 'development';

const rootDir = new URL('..', import.meta.url).pathname;
const dist = resolve(rootDir, 'dist');
const distDev = resolve(rootDir, 'dist-dev');
const devtool = isDev ? 'eval' : 'source-map';

const notEmpty = (a) => a;
const clean = (array) => array.filter(notEmpty);

const noParse = (a) => a.endsWith('.spec.js');
const options = {
    babelrc: true,
};

const rules = clean([
    !isDev && {
        test: /\.[mc]?js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
    },
    isDev && {
        test: /\.[mc]?js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options,
    },
]);

const plugins = [
    new NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
    }),
    new NormalModuleReplacementPlugin(/^putout$/, '@putout/bundle'),
    new EnvironmentPlugin({
        NODE_ENV,
    }),
    new WebpackBar(),
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
];

const splitChunks = {
    chunks: 'all',
    cacheGroups: {
        abcCommon: {
            name: 'cloudcmd.common',
            chunks: (chunk) => {
                const lazyChunks = [
                    'sw',
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

export default {
    resolve: {
        symlinks: false,
        alias: {
            'node:process': 'process',
            'node:path': 'path',
        },
        fallback: {
            path: import.meta.resolve('path-browserify'),
            process: import.meta.resolve('process/browser'),
            util: import.meta.resolve('util'),
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
        'help': `${dirCss}/help.css`,
        'view': `${dirCss}/view.css`,
        'config': `${dirCss}/config.css`,
        'terminal': `${dirCss}/terminal.css`,
        'user-menu': `${dirCss}/user-menu.css`,
        'sw': `${dir}/sw/sw.mjs`,
        'cloudcmd': `${dir}/cloudcmd.mjs`,
        [`${modules}/edit`]: `${dirModules}/edit.mjs`,
        [`${modules}/edit-file`]: `${dirModules}/edit-file.js`,
        [`${modules}/edit-file-vim`]: `${dirModules}/edit-file-vim.js`,
        [`${modules}/edit-names`]: `${dirModules}/edit-names.js`,
        [`${modules}/edit-names-vim`]: `${dirModules}/edit-names-vim.js`,
        [`${modules}/menu`]: `${dirModules}/menu/index.mjs`,
        [`${modules}/view`]: `${dirModules}/view/index.mjs`,
        [`${modules}/help`]: `${dirModules}/help.js`,
        [`${modules}/markdown`]: `${dirModules}/markdown.js`,
        [`${modules}/config`]: `${dirModules}/config/index.mjs`,
        [`${modules}/contact`]: `${dirModules}/contact.js`,
        [`${modules}/upload`]: `${dirModules}/upload.mjs`,
        [`${modules}/operation`]: `${dirModules}/operation/index.mjs`,
        [`${modules}/konsole`]: `${dirModules}/konsole.mjs`,
        [`${modules}/terminal`]: `${dirModules}/terminal.js`,
        [`${modules}/terminal-run`]: `${dirModules}/terminal-run.js`,
        [`${modules}/cloud`]: `${dirModules}/cloud.mjs`,
        [`${modules}/user-menu`]: `${dirModules}/user-menu/index.mjs`,
        [`${modules}/polyfill`]: `${dirModules}/polyfill.js`,
        [`${modules}/command-line`]: `${dirModules}/command-line.mjs`,
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

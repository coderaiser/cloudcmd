const path = require('path');
const webpack = require('webpack');
const {optimize} = webpack;
const {UglifyJsPlugin} = optimize;

const dir = './client';

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

module.exports = {
    devtool,
    entry: {
        cloudcmd: `${dir}/cloudcmd.js`,
        edit: `${dir}/edit.js`,
        'edit-file': `${dir}/edit-file.js`,
        'edit-names': `${dir}/edit-names.js`,
        menu: `${dir}/menu.js`,
        view: `${dir}/view.js`,
        help: `${dir}/help.js`,
        markdown: `${dir}/markdown.js`,
        config: `${dir}/config.js`,
        contact: `${dir}/contact.js`,
        upload: `${dir}/upload.js`,
        operation: `${dir}/operation.js`,
        konsole: `${dir}/konsole.js`,
        cloud: `${dir}/cloud.js`,
        polyfill: `${dir}/polyfill.js`,
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
        loaders: [{
            test: /\.js$/,
            exclude: /(node_)?modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }
        ]
    }
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

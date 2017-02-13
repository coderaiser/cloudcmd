const path = require('path');
const webpack = require('webpack');
const {optimize} = webpack
const {UglifyJsPlugin} = optimize;

const dir = './client';

const {env} = process;
const isDebug = env.NODE_ENV === 'debug';

const dist = path.resolve(__dirname, 'dist');
const distDebug = path.resolve(__dirname, 'dist-debug');
const devtool = isDebug ? 'eval' : 'source-map';

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
        cloud: `${dir}/cloud.js`
    },
    output: {
        filename: '[name].js',
        path: isDebug ? distDebug : dist,
        libraryTarget: 'umd'
    },
    plugins: [
        new UglifyJsPlugin({
            sourceMap: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'cloudcmd',
            filename: 'cloudcmd.js',
        }),
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


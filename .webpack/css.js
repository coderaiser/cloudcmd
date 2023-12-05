'se strict';

const fs = require('fs');
const {
    basename,
    extname,
    join,
} = require('path');

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const {env} = process;
const isDev = env.NODE_ENV === 'development';

const cssNames = [
    'nojs',
    'view',
    'config',
    'terminal',
    'user-menu',
    ...getCSSList('columns'),
];

const plugins = [
    new MiniCssExtractPlugin({
        chunkFilename: '[name].css',
    }),
    new CssMinimizerPlugin(),
];

const rules = [{
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, "css-loader"],
}, /*{
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    use: {
        loader: 'url-loader',
        options: {
            limit: 100_000,
        },
    },
}*/];

module.exports = {
    plugins,
    module: {
        rules,
    },
    optimization: {
        splitChunks: {
          cacheGroups: {
            cloudcmdCommon: {
              type: "css/mini-extract",
              name: "cloudcmd.common",
              chunks: (chunk) => {
                  //return !/css\/(nojs|view|config|terminal|user-menu|columns.*)\.css/.test(name)
                  console.log(chunk);
                return !chunk.name.includes('modules');
              },
              enforce: true,
            },
          },
        },
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


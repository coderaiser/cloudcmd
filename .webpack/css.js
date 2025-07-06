'use strict';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const clean = (a) => a.filter(Boolean);

const plugins = clean([
    new MiniCssExtractPlugin({
        filename: '[name].css',
    }),
]);

const rules = [{
    test: /\.css$/i,
    use: [MiniCssExtractPlugin.loader, {
        loader: 'css-loader',
        options: {
            url: true,
        },
    }],
}, {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    type: 'asset/inline',
}];

module.exports = {
    plugins,
    module: {
        rules,
    },
};

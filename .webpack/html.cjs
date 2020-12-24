'use strict';

const {env} = process;
const isDev = env.NODE_ENV === 'development';

const HtmlWebpackPlugin = require('html-webpack-plugin');

const plugins = [
    new HtmlWebpackPlugin({
        inject: false,
        template: 'html/index.html',
        minify: !isDev && getMinifyHtmlOptions(),
    }),
];

module.exports = {
    plugins,
};

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
    };
}


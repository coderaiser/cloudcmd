import {env} from 'node:process';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const isDev = env.NODE_ENV === 'development';

export const plugins = [
    new HtmlWebpackPlugin({
        inject: false,
        template: 'html/index.html',
        minify: !isDev && getMinifyHtmlOptions(),
    }),
];

function getMinifyHtmlOptions() {
    return {
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeCDATASectionsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        /* оставляем, поскольку у нас
         * в элемент fm генерируеться
         * таблица файлов
         */
        removeEmptyElements: false,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        
        minifyJS: true,
    };
}

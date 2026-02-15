import {env} from 'node:process';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import cssnano from 'cssnano';

const isDev = env.NODE_ENV === 'development';

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

export default {
    plugins,
    module: {
        rules,
    },
};

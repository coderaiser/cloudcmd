import {env} from 'node:process';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

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
    mode: isDev ? 'development' : 'production',
    plugins,
    module: {
        rules,
    },
    optimization: {
        minimize: !isDev,
        minimizer: [
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: ['default', {
                        svgo: false,
                    }],
                },
            }),
        ],
    },
};

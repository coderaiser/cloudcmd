import {env} from 'node:process';
import {rspack} from '@rspack/core';

const {CssExtractRspackPlugin} = rspack;
const isDev = env.NODE_ENV === 'development';

const plugins = [
    new CssExtractRspackPlugin({
        filename: '[name].css',
    }),
];

const rules = [{
    test: /\.css$/i,
    use: [CssExtractRspackPlugin.loader, {
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
            new rspack.LightningCssMinimizerRspackPlugin(),
        ],
    },
};

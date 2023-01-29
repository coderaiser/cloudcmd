'se strict';

const fs = require('fs');
const {
    basename,
    extname,
    join,
} = require('path');

//const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const {env} = process;
const isDev = env.NODE_ENV === 'development';

//const extractCSS = (a) => new ExtractTextPlugin(`${a}.css`);
const extractCSS = (a) => new MiniCssExtractPlugin({
    filename: `${a}.css`,
});

const extractMain = new MiniCssExtractPlugin({
    chunkFilename: '[name]',
});

const cssNames = [
    'nojs',
    'view',
    'config',
    'terminal',
    'user-menu',
    ...getCSSList('columns'),
];

const cssPlugins = cssNames.map(extractCSS);
const clean = (a) => a.filter(Boolean);

const plugins = [//clean([
    //...cssPlugins,
    //extractMain,
    //!isDev && new OptimizeCssAssetsPlugin(),
    new MiniCssExtractPlugin(),
    new CssMinimizerPlugin(),
];//);

const rules = [{
    test: /\.css$/,
    //exclude: /css\/(nojs|view|config|terminal|user-menu|columns.*)\.css/,
    use: [MiniCssExtractPlugin.loader, "css-loader"],
    //use: [extractMain().loader, "css-loader"],
    /*
    use: extractMain.extract([
        'css-loader',
    ]),
    */
},
...cssPlugins.map(extract), {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    use: {
        loader: 'url-loader',
        options: {
            limit: 100_000,
        },
    },
}];

module.exports = {
    plugins,
    module: {
        rules,
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

function extract(extractPlugin) {
    const {filename} = extractPlugin.options;
    console.log(':::', filename);
    
    return {
        test: RegExp(`css/${filename}`),
     use: [new MiniCssExtractPlugin(), "css-loader"],
     /*
        use: extractPlugin.extract([
            'css-loader',
        ]),
        */
    };
}


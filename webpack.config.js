const webpack = require('webpack');

const ENVIRONMENT = process.env.NODE_ENV || 'production';
const config = {
    debug: true,
    stats: {
        colors: true,
        reasons: true,
    },
    entry: './src/index.js',
    output: {
        path: __dirname,
        libraryTarget: 'commonjs2',
        filename: ENVIRONMENT === 'production' ? '/dist/index.min.js' : '/dist/index.js',
    },
    module: {
        loaders: [
            {
                test: /.js$/,
                loader: 'babel-loader',
            },

        ],
    },
    plugins: [],
};

if (ENVIRONMENT === 'production') {
    config.devtool = 'cheap-module-source-maps';
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        output: {
            comments: false,
        },
        compress: {
            warnings: false,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
        },
        sourceMap: true,
    }));
}

module.exports = config;

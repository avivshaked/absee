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
        filename: '/dist/index.js',
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
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;

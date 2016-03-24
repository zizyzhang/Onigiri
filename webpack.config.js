/**
 * Created by Zizy on 3/24/16.
 */
module.exports = {
    entry: './front/js/main.js',
    output: {
        filename: './front/dist/bundle.js'
    },
    module: {
        loaders: [
            { test: /\.coffee$/, loader: 'coffee-loader' },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};


/**
 * Created by Zizy on 3/24/16.
 */
module.exports = {
    entry: './front/js/main.js',
    output: {
        filename: './front/dist/js/bundle.js'
    },
    externals: {
    },
    module: {
        loaders: [
             {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};


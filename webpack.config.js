/**
 * Created by Zizy on 3/24/16.
 */
module.exports = {
    entry: './front/js/main.js',
    output: {
        filename: './front/dist/js/bundle.js'
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        //"framework7": "Framework7"
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


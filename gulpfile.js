'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const webpack = require('webpack-stream');
const plumber = require('gulp-plumber');
var sourcemaps = require("gulp-sourcemaps");


gulp.task('default', ['front','server','watch']);

gulp.task('front',()=>{
    return gulp.src('front/js/*.js')
        .pipe(plumber())
        .pipe(webpack({
            watch: true,
            output: {
                filename: 'bundle.js',
                sourceMapFilename:'bundle.map'
            },
            module: {
                loaders: [
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['stage-0','es2015']
                        }
                    }
                ]
            },
            devtool: 'source-map'

        }))
        //.pipe(gulpCommonJS())
        .pipe(gulp.dest('front/dist/js'));
});

gulp.task('server',()=>{
    return gulp.src('server/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('server/dist'));
});

gulp.task('watch', function() {
    gulp.watch(['server/*.js'], ['server']);
});
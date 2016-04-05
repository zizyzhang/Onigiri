const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const webpack = require('webpack-stream');
const plumber = require('gulp-plumber');

gulp.task('default', ['front','server','watch']);

gulp.task('front',()=>{
    return gulp.src('front/js/*.js')
        .pipe(plumber())
        .pipe(webpack({
            watch: true,
            output: {
                filename: 'bundle.js',
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
        }))
        //.pipe(gulpCommonJS())
        .pipe(gulp.dest('front/dist/js'));
});

gulp.task('server',()=>{
    return gulp.src('server/*.js')
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest('server/dist'));
});

gulp.task('watch', function() {
    gulp.watch(['server/*.js'], ['server']);
});
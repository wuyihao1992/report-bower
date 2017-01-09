'use strict';

var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var maps = require('gulp-sourcemaps');
var pref = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var del = require('del');
var runSequence = require('run-sequence').use(gulp);
var argv = require('yargs').argv;
var browserSync = require('browser-sync').create();

gulp.task('clean', function(cb) {
    return del([
        'dist/**/*',
        'js/dist/*',
        'css/*'
    ], cb);
});

gulp.task('build', ['clean'], function(cb) {
    return gulp.start(['framework', 'sass'], cb);
});

// gulp.task('browser-sync', function() {
//     browserSync({
//         server: {
//             //指定服务器启动根目录
//             baseDir: "./"
//         }
//     });
//     //监听任何文件变化，实时刷新页面
//     gulp.watch("./**/*.*").on('change', browserSync.reload);
// });

gulp.task('sass', function() {
    gulp.src([
            'sass/icons/*'
        ])
        .pipe(gulp.dest('css/icons'));
    return gulp.src('./sass/**/*.scss')
        .pipe(maps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(pref('last 2 versions'))
        //.pipe(rename({suffix: '.min'}))
        //.pipe(cleanCSS())
        .pipe(maps.write('.'))
        .pipe(gulp.dest('./css'));
});


gulp.task('framework', function() {
    gulp.src([
            'bower_components/jquery/dist/jquery.js',
            'bower_components/nprogress/nprogress.js',
            'bower_components/zepto/zepto.js',
            'bower_components/highcharts/highcharts.js',
            'bower_components/highcharts/modules/no-data-to-display.js',
            'bower_components/highcharts/highcharts-more.js',
            'bower_components/highcharts/modules/solid-gauge.js',
            'bower_components/touchslider/index.js',
            'js/public/common.js'
        ])
        .pipe(maps.init())
        .pipe(concat('framework.js'))
        //.pipe(uglify())
        .pipe(maps.write('.'))
        .pipe(gulp.dest('assets/js/'));

    gulp.src([
            'bower_components/font-awesome/css/font-awesome.css'
        ])
        .pipe(maps.init())
        .pipe(cleanCSS())
        .pipe(concat('framework.css'))
        .pipe(maps.write('.'))
        .pipe(gulp.dest('assets/css/'));

    gulp.src([
            'bower_components/font-awesome/fonts/*'
        ])
        .pipe(gulp.dest('assets/fonts/'));

    gulp.src([
        'bower_components/layer/src/**/*'
    ])
        .pipe(gulp.dest('assets/layer'));


});

gulp.task('js', function() {
    return gulp.src([])
        .pipe(maps.init())
        // .pipe(concat('base-data.js'))
        .pipe(gulp.dest('assets/js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(maps.write('.'))
        .pipe(gulp.dest('assets/js'));
});

gulp.task('watch', ['clean', 'sass'], function() {
    gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('default', ['watch']);
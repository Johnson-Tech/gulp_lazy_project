
var config = {
    src: '../src',
    build: '../dist/build'
};


/* utils */
var path = require('path');
var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var sass = require('gulp-ruby-sass');
var rename = require('gulp-rename');
var userref = require('gulp-useref');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');

/* vendor javascripts */
gulp.task('script-vender', function() {
    return gulp.src(path.join(config.src, 'common/vender/*.js'))
        .pipe(concat('vender.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.join(config.build, 'javascripts')))
        .pipe(browserSync.stream());
});

/* common javascripts */
gulp.task("script-base", function () {
    return gulp.src(path.join(config.src, 'common/javascripts/*.js'))
        .pipe(concat("base.js"))
        .pipe(uglify())
        .pipe(gulp.dest(path.join(config.build, "javascripts")))
        .pipe(browserSync.stream());
});

gulp.task('script', ['script-vender', 'script-base']);


/* stylesheet */
// gulp.task("style-vendor", function () {
//     return gulp.src(path.join(config.src, 'common/vender/*.css'))
//         .pipe(concat("vendor.css"))
//         .pipe(minify())
//         .pipe(gulp.dest(path.join(config.build, 'stylesheets')))
//         .pipe(browserSync.stream());
// });

gulp.task('style-base', function() {
    return gulp.src(path.join(config.src, 'common/stylesheets/*.css'))
        .pipe(concat("base.css"))
        .pipe(minify())
        .pipe(gulp.dest(path.join(config.build, 'stylesheets')))
        .pipe(browserSync.stream());
});




/* scss compile to css */
gulp.task('sass', function() {
    return sass(path.join(config.src, 'modules/**/scss/*.scss'), {base: '../', style: 'expanded'})
        .on('error', sass.logError)
        .pipe(rename(function(path) {
            path.dirname = path.dirname.replace(/scss/, '/css');
        }))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }))
        .pipe(browserSync.stream());
});

gulp.task("style", ["style-base", "sass"]);


/** html link useref **/
gulp.task('html', ['sass'], function() {
    return gulp.src([
            path.join(config.src, 'modules/main/*.html'),
            path.join(config.src, 'modules/sub/*.html')
        ])
        .pipe(userref({
            commonStyles: function() {
                return '<link rel="stylesheet" href="./stylesheets/base.css"> '
            },
            commonScripts: function () {
                return '<script src="./javascripts/vender.js"></script>' +
                    '<script src="./javascripts/base.js"></script>';
            }
        }))
        .pipe(gulp.dest(path.join(config.build)))
        .pipe(browserSync.stream());
});


/** clean **/
gulp.task("clean", function () {
    return del(config.build, {force: true});
});

gulp.task("debug", function (callback) {
    runSequence("clean", ["script", "style", "html"], callback);
});

/* watch */
gulp.task("watch-style", ["style", "sass", "html"], browserSync.reload);
gulp.task("watch-script", ["script", "html"], browserSync.reload);
gulp.task("watch-html", ["html"], browserSync.reload);



gulp.task("watch", ["debug"], function () {
    browserSync.init({
        server: {
            baseDir: path.join(config.build)
        },
        port: 5000
    });

    gulp.watch([
        path.join(config.src, "modules/**/scss/*.scss")
    ], ["watch-style"]);

    gulp.watch([
        path.join(config.src, "modules/**/js/*.js")
    ], ["watch-script"]);

    gulp.watch([
        path.join(config.src, "modules/**/*.html")
    ], ["watch-html"]);
});
// End Watch


gulp.task("default", ["watch"]);
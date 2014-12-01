var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cssMinify = require('gulp-minify-css'),
    zip = require('gulp-zip');

/* 压缩 CSS，JS */
gulp.task('minify', function () {
    gulp.src(['src/**/*.js'], {base: 'src'})
        .pipe(uglify())
        .pipe(gulp.dest('build'));

    gulp.src(['src/**/*.css'], {base: 'src'})
        .pipe(cssMinify())
        .pipe(gulp.dest('build'));
});

/* 复制图片等其他文件 */
gulp.task('copy', function () {
    gulp.src(['src/**', '!src/**/*.js', '!src/**/*.css'], {base: 'src'})
        .pipe(gulp.dest('build'));
});

/* 打包压缩 */
gulp.task('package', ['minify', 'copy'], function () {
    gulp.src('build/**')
        .pipe(zip('build.zip'))
        .pipe(gulp.dest('./'));
});

const gulp = require('gulp');
const rename = require('gulp-rename');
const vueify = require('gulp-vueify');
const browserify = require('gulp-browserify');

gulp.task('client', function() {
  gulp.src('core/client/app.vue')
      .pipe(browserify({transform: ['vueify'], debug: true}))
      .pipe(rename({
        extname: ".js"
      }))
      .pipe(gulp.dest('core/client/public/build/'));
});

gulp.task('watch', function() {
  gulp.watch(['core/client/app.vue'], ['client']);
});

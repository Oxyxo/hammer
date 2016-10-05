const gulp = require('gulp');
const minify = require('gulp-minify');

gulp.task('client', function() {
  gulp.src('core/cliet/public/js/*.js')
      .pipe(minify())
      .pipe(gulp.dest('core/client/public/build'));
});

gulp.task('watch', function() {
  gulp.watch([
    'core/client/public/js/*',
    'core/client/templates/*'
  ], ['client']);
});

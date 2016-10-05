const fs = require('fs');
const gulp = require('gulp');
const vueify = require('vueify');
const babelify = require('babelify');
const browserify = require('browserify');

gulp.task('client', function() {
  browserify('core/client/public/js/app.js')
            .transform(vueify)
            .bundle()
            .pipe(fs.createWriteStream('core/client/public/build/client.js'));
});

gulp.task('watch', function() {
  gulp.watch(['core/client/public/js/app.js'], ['client']);
});

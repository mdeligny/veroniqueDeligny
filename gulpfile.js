// Requis
var gulp = require('gulp');

// Include plugins
var plugins = require('gulp-load-plugins')(); // tous les plugins de package.json
var del = require('del');
var imagemin = require('gulp-imagemin');
var inject = require('gulp-inject');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var series = require('stream-series');

// Variables de chemins
var source = './src'; // dossier de travail
var destination = './dist'; // dossier à livrer

gulp.task('clean', function () {
  return del([destination]);
});

// Tâche "build" =  autoprefixer + CSScomb + beautify (source -> destination)
gulp.task('css', function () {
  return gulp.src(source + '/assets/css/**.css')
    .pipe(plugins.csscomb())
    .pipe(plugins.cssbeautify({indent: '  '}))
    .pipe(plugins.autoprefixer())
    .pipe(rename('app.css'))
    .pipe(gulp.dest(destination + '/assets/css/'));
});

gulp.task('style', function() {
  return gulp.src([
    './node_modules/materialize-css/bin/materialize.css'
  ])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(destination + '/assets/css/'))
});

gulp.task('images', function () {
  return gulp.src(source + '/assets/img/**.*')
    .pipe(imagemin())
    .pipe(gulp.dest(destination + '/assets/img'));
});

gulp.task('fonts', function () {
  return gulp.src(source + '/assets/fonts/**/**.*')
    .pipe(gulp.dest(destination + '/assets/fonts'));
});

gulp.task('app', function () {
  return gulp.src(source + '/js/**.js')
    .pipe(concat('concat.js'))
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(destination + '/js/'))
});

gulp.task('scripts', function () {
  return gulp.src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/materialize-css/bin/materialize.js'
  ])
    .pipe(concat('concat.js'))
    .pipe(rename('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(destination + '/js/'))
});

gulp.task('index', function () {
  var target = gulp.src('./dist/index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:

  var vendorStream = gulp.src(['./dist/js/vendor.min.js', './dist/assets/css/vendor.css'], {read: false});

  var appStream = gulp.src(['./dist/js/app.min.js', './dist/assets/css/app.css'], {read: false});

  return target.pipe(inject(series(vendorStream, appStream), {ignorePath: 'dist/', addRootSlash: false}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('inject', function () {
  return gulp.src(source + '/**.*')
    .pipe(gulp.dest(destination));
});

gulp.task('assets', gulp.parallel('images', gulp.series('style','css'), 'fonts'));

// Tâche "build"
gulp.task('build', gulp.parallel('assets', gulp.series('scripts', 'app'), 'inject'));

// Tâche "prod" = Build + minify
gulp.task('prod', gulp.series('clean', 'build', 'index'));

// Tâche "watch" = je surveille *less
gulp.task('watch', function () {
  gulp.watch(source + '/assets/css/*.css', ['build']);
});

// Tâche par défaut
gulp.task('default', gulp.series('build'));
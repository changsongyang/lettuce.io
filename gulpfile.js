// Gulp plugins
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    config = require('./configDefault'),
    merge = require('merge'),
    shell = require('gulp-shell');

config = config.build;

// Cleaner for cleaning on a per-task basis
var copy = require('./tasks/copy')(config);
var cleaner = require('./tasks/clean')(config);

// Prepare prod build
gulp.task('production', function(){
    var configProduction = require('./configProduction');
    config = merge(config, configProduction);
});

gulp.task('clean:copy', cleaner('copy'));
gulp.task('clean:scripts', cleaner('scripts'));

gulp.task('clean:styles', cleaner('styles'));
gulp.task('clean:scripts', cleaner('scripts'));
gulp.task('clean:fonts', cleaner('fonts'));
gulp.task('clean', ['clean:copy', 'clean:scripts', 'clean:styles', 'clean:scripts', 'clean:fonts']);

// Concat scripts (described in config)
gulp.task('scripts', ['clean:scripts'], require('./tasks/scripts')(config));

// Compile next css
gulp.task('styles', ['clean:styles'], require('./tasks/styles')(config));

// Copy static files that don't need any build processing to `public/dist`
gulp.task('copy:src', ['clean:copy'], copy("internal"));
gulp.task('copy:fontAwesome', ['clean:fonts'], copy ("awesome"));
gulp.task('copy', ['copy:src', 'copy:fontAwesome']);


// Environment
if (process.env.NODE_ENV == 'production') {
    gutil.log("Starting ", gutil.colors.yellow("Production environment"));
    gulp.task('assemble', ['production', 'scripts', 'copy', 'styles'], new function (){
        return shell.task(['./gradlew build']);
    });
    gulp.task('default', ['assemble']);
} else {
    gutil.log("Starting ", gutil.colors.yellow("Dev environment"));

    // Bundle and watch for changes to all files appropriately
    gulp.task('serve', ['scripts', 'copy', 'styles'], require('./tasks/serve')(config));
    gulp.task('default', ['serve']);
}
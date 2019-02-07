

//@mc 1902020708 GULP of GIX Pattern Lab Command Line - an assistant to create patterns

//@v 190202 Stability

//@mastery Bump version and publish npm
var gulp = require('gulp'),
	watch = require('gulp-watch'),
	bump = require('gulp-bump'),
	filter = require('gulp-filter'),
	git = require('gulp-git'),
	shell = require('gulp-shell'),
	tagversion = require('gulp-tag-version'),
	tlid = require('tlid');

gulp.task('stream', function () {
	// Endless stream mode
	return watch('css/**/*.css', { ignoreInitial: false })
		.pipe(gulp.dest('build'));
});



const changed = require('gulp-changed');
const ngAnnotate = require('gulp-ng-annotate'); // Just as an example

const SRC = 'src/*.js';
const DEST = 'dist';

gulp.task('default', () =>
	gulp.src(SRC)
		.pipe(changed(DEST))
		// `ngAnnotate` will only get the files that
		// changed since the last time it was run
		.pipe(ngAnnotate())
		.pipe(gulp.dest(DEST))
);



//@s use release-it command line
gulp.task('release', function () {
	production = true;

	return gulp.src("./")
		.pipe(git.commit('Releasing ' + '-' + tlid.get()))

		// read only one file to get version number
		.pipe(filter('package.json'))
		.pipe(bump())

		// Tag it
		.pipe(tagversion())

		// Publish files and tags to endpoint
		.pipe(shell([
			'git push '
		]));
});
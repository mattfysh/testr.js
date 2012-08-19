var config = module.exports;

require('buster').stackFilter.filters.push('jasmine.js');

['2.0.5', '1.0.8'].forEach(function(v) {
	config['require.js ' + v] = {
		env: 'browser',
		rootPath: '../',
		autoRun: false,
		libs: [
			'lib/require.' + v + '.js'
		],
		src: [
			'testr.js',
			'src/main.js',
		],
		testHelpers: [
			'lib/jasmine-1.2.0.rc3/jasmine.js',
			'lib/jasmine-buster.js',
			'spec/helper.js'
		],
		specs: [
			'spec/testr.*.spec.js'
		],
		resources: [
			'lib/**/*.js',
			'sibling/**/*.js',
			'src/**/*.js',
			'src/**/*.html',
			'spec/**/*.js',
			'stub/**/*.js'
		]
	};
});

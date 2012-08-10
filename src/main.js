(function() {
	// create paths
	var paths = {
			'path': 'pathtarget',
			'sibling': '../sibling',
			'text': '../lib/plugins/require/text.' + (require.version === '1.0.8' ? '1.0.8' : '2.0.0'),
			'pluginobj': '../lib/plugins/require/pluginobj',
			'jquery': '../lib/jquery-1.7.2'
		},
		required = [],
		jasmineEnv = jasmine.getEnv();

	function requireSet(set) {
		required = required.concat(set);
		require(set);
	}

	require.config({
		paths: paths
	});

	// basic require
	requireSet(['fn', 'obj', 'hasdeps', 'require/uses']);

	// advanced
	requireSet(['plugins/uses', 'usejquery', 'cjs/wrap']);

	// advanced module names
	requireSet(['path', '../sibling/outsidebase', 'sibling/pathtarget', 'rename/def', 'rename/use']);

	// exports
	requireSet(['exports/uses', 'exports/returns']);

	// setup a new context for collection the actual objects
	actuals = require.config({
		context: 'actuals',
		paths: paths,
		baseUrl: 'src'
	});

	// once the main suite of tests has completed, verify testr modules against actuals
	jasmineEnv.currentRunner_.finishCallback = function() {
		// prevent infinite loop
		jasmineEnv.currentRunner_.finishCallback = function() {};

		// disable testr
		testr.disable();

		// request all the modules with a fresh context
		actuals(required, function() {
			// setup a test for each module
			describe('module verification', function() {
				for (var i = 0; i < required.length; i += 1) {
					var moduleName = required[i];
					it(moduleName, function() {
						expect(testr(moduleName)).toEqual(actuals(moduleName));
					});
				}
			});

			// execute the module verification tests
			jasmineEnv.execute();
		});
	};

}());

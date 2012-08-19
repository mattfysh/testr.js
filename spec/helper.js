(function() {
	// add buster reporter
	var env = jasmine.getEnv(),
		busterReporter = new jasmine.BusterReporter();

	// add buster reporter
	env.addReporter(busterReporter);

	// continue module verification after intermediatary testing
	busterReporter.reportRunnerResults = function() {
		var testrApp = window.testrApp,
			actuals = require.config({
				context: 'actuals',
				paths: testrApp.paths,
				baseUrl: testrApp.baseUrl
			}),
			required = testrApp.required;
		
		// perform module verification
		define.restore();
		actuals(required, function() {
			// setup a test for each module
			describe('module verification', function() {
				var len = required.length;
				for (var i = 0; i < len; i += 1) {
					var moduleName = required[i];
					it(moduleName, function() {
						expect(testr(moduleName)).toEqual(actuals(moduleName));
					});
				}
			});

			// expose the prototype function
			delete busterReporter.reportRunnerResults;

			// execute the module verification tests
			env.execute();
		});
	};

	// prevent script errors on require
	require.onError = function(err) {
		if (err.requireType !== 'scripterror') {
			throw err;
		}
	}

	// wait until all required calls have complete
	window.testrApp.onload = function() {
		// run tests
		env.execute();
	};
}());
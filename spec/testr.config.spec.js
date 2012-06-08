describe('testr config', function() {

	var origRequire = require;

	afterEach(function() {
		// return to original state
		require = origRequire;
		testr.config({
			autoLoad: true
		});
	});

	it('loads modules from path', function() {
		var module = testr('path');
		expect(module.viaPath).toBe(true);
	});

	it('loads modules from path with parent syntax', function() {
		var module = testr('sibling/pathtarget');
		expect(module.siblingPathTarget).toBe(true);
	});

	it('can disable auto-loading', function() {
		// override
		var origRequire = require,
			called = false;

		// redefine require to capture any calls made
		require = function(req) {
			if (req && req.deps) {
				called = true;
			}
		}

		// configure testr then define a module
		testr.config({
			autoLoad: false
		});
		define('disableAutoLoad', {});

		expect(called).toBe(false);
	});

});
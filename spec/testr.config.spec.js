describe('testr config', function() {

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

		// return to original state
		testr.config({
			autoLoad: true // return to default behavior
		});
		require = origRequire;

		expect(called).toBe(false);
	});

});
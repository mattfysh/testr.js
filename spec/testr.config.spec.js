describe('testr config', function() {

	var origRequire = require;

	afterEach(function() {
		// return to original state
		require = origRequire;
		testr.config({
			autoLoad: true,
			whitelist: []
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

	it('allows actual dependencies for white list', function() {
		// configure whitelist
		testr.config({
			whitelist: ['deeper/samedir']
		});

		// the following should not error
		testr('deeper/isdep');
	});

	it('errors when using non-whitelisted actual dependencies', function() {
		function getModule() {
			testr('deeper/isdep');
		}

		// configure whitelist
		testr.config({
			whitelist: ['deeper/someotherdep']
		});

		expect(getModule).toThrow(Error('module must be stubbed: deeper/samedir'));
	});

	it('does not error when stubbing non-whitelisted dependencies', function() {
		// configure whitelist
		testr.config({
			whitelist: ['deeper/someotherdep']
		});

		// the following should not error
		testr('deeper/isdep', {
			'./samedir': {}
		});
	});

});
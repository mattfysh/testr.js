// TODO: allow samedir reference to './' in stubs

describe('testr', function() {

	it('doesnt execute modules during loading', function() {
		// as they may pollute other modules, or scopes
		expect(window.polluted).toBeUndefined();
	});

	describe('function', function() {

		var module;

		beforeEach(function() {
			module = testr('fn');
		});

		it('returns a module', function() {
			expect(module).toBeDefined();
		});

		it('returns the requested module', function() {
			expect(module.functionDef).toBe(true);
		});

		it('prevents pollution on module', function() {
			module.polluted = true;
			module = testr('fn');
			expect(module.polluted).toBeUndefined();
		});

		it('prevents pollution in module closure', function() {
			module.polluteVal();
			expect(module.getVal()).toBe('polluted');
			module = testr('fn');
			expect(module.getVal()).toBe('unpolluted');
		});

	});

	describe('object', function() {

		var module;

		beforeEach(function() {
			module = testr('obj');
		});

		it('returns the requested module', function() {
			expect(module.objectDef).toBe(true);
		});

		it('prevents pollution', function() {
			module.polluted = true;
			module = testr('obj');
			expect(module.polluted).toBeUndefined();
		});

	});

	describe('directory modules', function() {

		it('can be grabbed directly', function() {
			var deepDep = testr('deeper/isdep');
			expect(deepDep.deep).toBe(true);
		});

		it('can be grabbed with the parent syntax', function() {
			var module = testr('../sibling/outsidebase');
			expect(module.outsideBase).toBe(true);
		});

	});

});
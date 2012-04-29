describe('testr with real deps', function() {

	var module;

	beforeEach(function() {
		module = testr('hasdeps');
	});

	it('returns a module', function() {
		expect(module).toBeDefined();
	});

	it('loads module and deps', function() {
		expect(module.dep).toBeDefined();
		expect(module.dep.isDep).toBe(true);
	});

	it('loads deeper deps', function() {
		expect(module.dep.deepDep).toBeDefined();
	});

	it('prevents deep pollution', function() {
		module.dep.deepDep.polluted = true;
		module = testr('hasdeps');
		expect(module.dep.deepDep.polluted).toBeUndefined();
	});

});
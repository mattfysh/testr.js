describe('testr with stubs', function() {

	var module,
		stubDep = {
			isStubbed: true
		};

	beforeEach(function() {
		module = testr('hasdeps', {
			'isdep': stubDep
		});
	});

	it('works on actual deps', function() {
		expect(module.dep.isStubbed).toBe(true);
	});

	it('keeps unstubbed as real', function() {
		expect(module.objDep.objectDef).toBe(true);
	});

	it('works on nested deps', function() {
		module = testr('hasdeps', {
				'deeper/samedir': stubDep
			});
		expect(module.dep.deepDep.relDep.isStubbed).toBe(true);
	});

	it('doesnt use stub for module under test', function() {
		module = testr('hasdeps', {
			'hasdeps': {
				stubbed: true
			}
		});
		expect(module.stubbed).toBeUndefined();
	});
	
});
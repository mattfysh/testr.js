describe('testr external stub', function() {

	it('is used when flag is present', function() {
		var hasDeps = testr('hasdeps', true);
		expect(hasDeps.dep.isExternalStub).toBe(true);
	});

	it('takes lower priority than the stub object', function() {
		var hasDeps = testr('hasdeps', {
			'isdep': {
				takesPrecedence: true
			}
		}, true);
		expect(hasDeps.dep.takesPrecedence).toBe(true);
		expect(hasDeps.dep.isExternalStub).toBeUndefined();
	});

	it('isnt used for module under test', function() {
		var isDep = testr('isdep', true);
		expect(isDep.isDep).toBe(true);
	});

	it('allows more than one external stub', function() {
		var hasDeps = testr('hasdeps', true);
		expect(hasDeps.objDep.isExternalStub).toBe(true);
	});
	
});
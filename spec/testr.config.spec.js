describe('testr config', function() {

	it('loads modules from path', function() {
		var module = testr('path');
		expect(module.viaPath).toBe(true);
	});

	it('loads modules from path with parent syntax', function() {
		var module = testr('sibling/pathtarget');
		expect(module.siblingPathTarget).toBe(true);
	});

});
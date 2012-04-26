var deps, stubDep;

// stubbing
stubDep = {
	getValue: sinon.stub().returns(5)
};

// dependency map
deps = [stubDep, 'realdep2'];

test('app', deps, function(app) {
	// testing
	describe('Application module', function() {

		it('defines an initialize function', function() {
			expect(app.initialize).toBeDefined()
		});

		it('adds deps together', function() {
			expect(app.addDeps()).toBe(7);
		});

	});
});
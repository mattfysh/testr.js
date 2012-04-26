(function() {
	var deps, stubDep;

	// stubbing
	stubDep = {};
	stubDep.getValue = sinon.stub().returns(5);

	// dependency map
	deps = [stubDep, 'realdep2'];

	test('app', deps, function(app) {
		// testing
		describe('Application module', function() {

			it('defines an initialize function', function() {
				expect(app.initialize).toBeDefined()
			});

			it('calls stub getValue function', function() {
				app.addDeps();
				expect(stubDep.getValue.called).toBe(true);
			});

			it('adds dependency values', function() {
				expect(app.addDeps()).toBe(7);
			});

		});
	});
}());
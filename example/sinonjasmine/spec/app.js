(function() {
	var deps, stubDep;

	// stubbing
	stubDep = {};
	stubDep.getValue = sinon.stub().returns(5);

	// dependency map
	deps = [stubDep, 'realdep2'];

	test('app', deps, function(getFreshApp) {
		var app = getFreshApp();
		// testing
		describe('Application module', function() {

			var x = 5;

			beforeEach(function() {
				x = 7;
			});

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

			it('should run before', function() {
				expect(x).toBe(7);
				x = 9;
			});

			it('runs before each it', function() {
				expect(x).toBe(7);
			});

		});

		describe('testr', function() {

			var app;

			beforeEach(function() {
				app = getFreshApp();
			});

			it('passes module under test', function() {
				expect(app.initialize).toBeDefined();
				app.polluted = true;
			});

			it('resets module when needed', function() {
				expect(app.polluted).toBeUndefined();
				stubDep.polluted = true;
			});

			it('resets dependency modules when needed', function() {
				expect(stubDep.polluted).toBeUndefined();
			});

		});
	});
}());
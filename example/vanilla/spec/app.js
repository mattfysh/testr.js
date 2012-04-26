var deps, stubDep;

// stubbing (upgrade to Sinon.JS)
stubDep = {
	getValue: function() {
		return 5;
	}
};

// dependency map
deps = [stubDep, 'realdep2'];

test('app', deps, function(app) {
	// testing (upgrade to Jasmine BDD)
	console.log('init is a function: ' + (typeof app.initialize === 'function'));
	console.log('addDeps is 7: ' + (app.addDeps() === 7));
});
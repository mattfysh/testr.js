# testr.js

Simple testing of require.js modules, with both real and stubbed dependencies

### Example Usage

```javascript
var deps, stubDep;

// stubbing
stubDep = {
	getValue: function() {
		return 5;
	}
};

// dependency map
deps = [stubDep, 'realdep2'];

test('app', deps, function(app) {
	// testing
	console.log('init is a function: ' + (typeof app.initialize === 'function'));
	console.log('addDeps is 7: ' + (app.addDeps() === 7));
});
```

### Example Usage - Sinon.JS and Jasmine BDD

```javascript
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
```
# testr.js

Simple testing of require.js modules, with both stubbed and script-loaded dependencies.

### Todo

* Optional dependencies array
* Configurable requirejs config/context
* A new context for each call to the test API

### Usage

Each dependency can be stubbed, or loaded via RequireJS, using this simple test API:

```javascript
test('testModuleName', [dependency, ...*], callbackFunction);
```

**testModuleName**: the requirejs path name of the module to be unit tested.

**dependencies**: an array of dependencies. This can be a mixture of stubbed objects and requirejs path names, and is passed to the test module definition function in the same order.

**callbackFunction**: this function is passed a single parameter &mdash; the test module initialised using the stubbed and real dependencies array.

### Example

The module under test is described below.

```javascript
define(['realdep1', 'realdep2'], function(realDep1, realDep2) {
	return {
		initialize: function() {
			console.log('app init running');
		},
		addDeps: function() {
			return realDep1.getValue() + realDep2.getValue();
		}
	}
});
```

#### Basic Example

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

#### Using Sinon.JS and Jasmine BDD

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
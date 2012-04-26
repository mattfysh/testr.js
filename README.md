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
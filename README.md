# testr.js

Unit testing require.js modules, with both stubbed and script-loaded dependencies.
Compatible with all test frameworks - Jasmine, QUnit, JsTestDriver, Buster JS, etc.
Distributed under the MIT license.

### Usage

Create a new instance of a module under test using the testr method:

```javascript
testr('testModuleName', stubs);
```

**testModuleName**: the requirejs path name of the module to be unit tested.

**stubs**: a collection of stubs to use in place of dependencies. Each key is the requirejs path name of the module to be stubbed; each value is the module object to use as the stub.

### Example

The module under test is described below.

```javascript
// requirejs path: 'today'
// default string.format.style: 'long'

define(['string', 'util/date'], function(string, date) {
	return {
		getDateString: function() {
			return string.format('Today is %d', date.today);
		},
		setFormat: function(form) {
			string.format.style = form;
		},
		getFormat: function() {
			return string.format.style;
		}
	}
});
```

Testing the *today* module, while stubbing the *date* module and using the actual *string* implementation.

```javascript
var date, today, output, passed;

// stubbing
date = {};
date.today = new Date(2012, 3, 30);

// module instancing
today = testr('today', {'util/date': date});

// testing
output = today.getDateString();
passed = (output === 'Today is Monday, 30th April, 2012');
console.log('User-friendly date: ' + (passed ? 'PASS' : 'FAIL'));
```

#### Using Jasmine BDD

```javascript
describe('Today print', function() {

	var date = {}, today;

	function resetTestModule() {
		date.today = new Date(2012, 3, 30);
		today = testr('today', {'util/date': date});
	}

	beforeEach(function() {
		resetTestModule();	
	});

	it('is user-friendly', function() {
		expect(today.getDateString()).toBe('Today is Monday, 30th April, 2012');
	});

	it('updates the print format', function() {
		date.today = new Date(2012, 2, 30);
		today.setFormat('short');
		today.polluted = true;
		expect(today.getDateString()).toBe('Today is Fri, 30 Mar 12');
		expect(today.getFormat()).toBe('short');
	});

	it('is not polluted', function() {
		expect(today.polluted).toBeUndefined();
		expect(today.getDateString()).toBe('Today is Monday, 30th April, 2012');
		expect(today.getFormat()).toBe('long');
	});

});
```

### Projects using testr.js

#### [asq](https://github.com/mattfysh/asq)

Wrap a 'one-at-a-time' queue around an asynchronous function.

#### [after](https://github.com/mattfysh/after)

Another promises implementation.
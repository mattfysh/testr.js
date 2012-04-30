# testr.js

Unit testing require.js modules, with both stubbed and script-loaded dependencies.

### Usage

Create a new instance of a module under test using the testr method:

```javascript
testr('testModuleName', stubs);
```

**testModuleName**: the requirejs path name of the module to be unit tested.

**stubs**: an object of stubs to use in place of dependencies. Each key is the requirejs path name of the module to be stubbed; each value is the module object to use as the stub.

### Example

The module under test is described below.

```javascript
// requirejs path: 'printToday'
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

#### Basic Example

In the following examples

```javascript
var date, printToday, output, passed;

// stubbing
date = {
	today: new Date(2012, 3, 30)
};

// module instancing
printToday = testr('printToday', {
				'util/date': date
			});

// testing
output = printToday.getDateString();
passed = (output === 'Today is Monday, 30th April, 2012');
console.log('User-friendly date: ' + (passed ? 'PASS' : 'FAIL'));
```

##### Using Jasmine BDD

```javascript
describe('Today print', function() {

	var date, printToday;

	function resetTestModule() {
		date = {
			today: new Date(2012, 3, 30)
		}
		printToday = testr('printToday', {
						'util/date': date
					});
	}

	beforeEach(function() {
		resetTestModule();	
	});

	it('is user-friendly', function() {
		expect(printToday.getDateString()).toBe('Today is Monday, 30th April, 2012');
	});

	it('updates the print format', function() {
		date.today = new Date(2012, 2, 30);
		printToday.setFormat('short');
		printToday.polluted = true;
		expect(printToday.getDateString()).toBe('Today is Fri, 30 Mar 12');
		expect(printToday.getFormat()).toBe('short');
	});

	it('is not polluted', function() {
		expect(printToday.polluted).toBeUndefined();
		expect(printToday.getDateString()).toBe('Today is Monday, 30th April, 2012');
		expect(printToday.getForm()).toBe('long');
	});

});
```
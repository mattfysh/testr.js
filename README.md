# testr.js

Unit testing require.js modules, with both stubbed and script-loaded dependencies.
Compatible with all test frameworks - Jasmine, QUnit, JsTestDriver, Buster JS, etc.
Distributed under the MIT license.

### Usage

Create a new instance of a module under test using the `testr` method:

```javascript
testr('path/to/module', stubs);
testr('path/to/module', useExternal);
testr('path/to/module', stubs, useExternal);
```

**stubs**: *(optional)* a collection of stubs to use in place of dependencies. Each key is the requirejs path name of the module to be stubbed; each value is the stub. The key may also be relative to the test module path, i.e. beginning with `./`.

**useExternal**: *(optional)* a boolean to indicate if you wish to load in stubs from an external file. See the *Setup* section for details on where the external stub files should be placed.

### Setup

Include the requirejs script before testr.js, and be sure to have a valid `data-main` attribute that points to your application's top-level require call. Once all source code has been loaded, testr.js will automatically attempt to load all spec and external stub files. These will use an identical path, with a base url and suffix of either `spec` or `stub`. For example:

> **Source**: /src/path/to/module.js  
> **Spec**: /spec/path/to/module.spec.js  
> **Stub**: /stub/path/to/module.stub.js  

*Note: If the spec or stub file does not exist, this will result in a 404 error. Feel free to fork this project and suppress these, if possible.*

### Configuration

```javascript
testr.config({
	autoLoad: 'all',
	specUrl: 'spec',
	stubUrl: 'stub',
	whitelist: ['path/to/allowed/actual', 'underscore', 'backbone']
});
```

**autoLoad**: boolean or string to allow loading of associated `spec` and `stub` files. Allowed values are true, false, 'spec', 'stub', 'all'. The 'all' value is the same as true. *Default: false*

**specUrl**: path relative to your spec runner where spec files should be auto loaded from. *Default: spec*

**stubUrl**: path relative to your spec runner where stub files should be auto loaded from. *Default: stub*

**whitelist**: an array of paths that are allowed as actual dependencies. All other modules must be stubbed. *Default: off*

### Not Supported

* Non-default contexts

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

	beforeEach(function() {
		date.today = new Date(2012, 3, 30);
		today = testr('today', {'util/date': date});	
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

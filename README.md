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

Include the requirejs script before testr.js, and do not pre-define `require`, or use the `data-main` attribute. testr.js will monkey-patch the `require` and `define` methods, and enable your module definitions to be captured. Once all source code has been loaded, testr.js can be configured to attempt an automatic load of all spec and external stub files. These will use an identical path, with a configurable base url. For example:

> **Source**: /src/path/to/module.js  
> **Spec**: /spec/path/to/module.spec.js  
> **Stub**: /stub/path/to/module.stub.js  

*Note: If the spec or stub file does not exist, this will result in a 404 error.*

### Configuration

```javascript
testr.config({
	specBaseUrl: 'spec',
	stubBaseUrl: 'stub',
	whitelist: ['path/to/allowed/actual', 'underscore', 'backbone']
});
```

**specBaseUrl** and **stubBaseUrl**: when these base URLs are present, they will be used to automatically load spec and stub files. Each resource loaded will use the module definition paths, with these base URLs prefixed (see Setup, above).

**whitelist**: an array of paths that are allowed as actual dependencies. All other modules must be stubbed.

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

### Projects using testr.js

#### [asq](https://github.com/mattfysh/asq)

Wrap a 'one-at-a-time' queue around an asynchronous function.

### Tests

1. Clone this repo
2. `npm install`
3. `buster server`
4. Point one or more browsers at http://localhost:1111/
5. "Capture browser"
6. `buster test`

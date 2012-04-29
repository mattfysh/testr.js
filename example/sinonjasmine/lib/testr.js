var test = function(testModuleName, deps, cb) {
	var config = {
			context: 'test',
			baseUrl: 'src',
			urlArgs: 'bust=' + Date.now()
		},
		origDefine = define,
		origScriptLoad = require.onScriptLoad,
		lastDefArgs,
		reqDeps;

	// overwrite require js functions to hook into script loading
	define = function(deps, moduleFn) {
		if (!moduleFn) moduleFn = deps;
		lastDefArgs = [deps, moduleFn];
	}

	require.onScriptLoad = function(evt) {
		var node = evt.currentTarget,
			moduleName = node.getAttribute("data-requiremodule");

		// if script is module under test, define it as the module function to be built later
		if (moduleName === testModuleName) {
			origDefine(function() {
				return lastDefArgs[1];
			});
		} else {
			origDefine.apply(null, lastDefArgs);
		}

		// tell require.js to use last define (exec above) for this module
		origScriptLoad(evt);
	}

	// determine which dependencies will be loaded via requirejs
	reqDeps = [testModuleName].concat(deps.filter(function(d) {
		return typeof d === 'string';
	}));

	// make call to require
	require(config, reqDeps, function() {
		var args = [].slice.call(arguments),
			testModuleFn = args.shift(),
			getFreshTestModule;

		// restore require js
		define = origDefine;
		require.onScriptLoad = origScriptLoad;

		// map dependencies
		deps = deps.map(function(d) {
			if (typeof d === 'string') {
				return args.shift()
			} else {
				return d;
			}
		});

		// build module
		getFreshTestModule = function() {
			return testModuleFn.apply(null, deps);
		};

		// pass module back for testing
		cb(getFreshTestModule);
	});
};
var testr, require, define;

(function() {

	var origRequire = require,
		origDefine = define,
		origOnScriptLoad = require.onScriptLoad,
		noop = function() {},
		moduleMap = {},
		stubMap = {},
		depLoad = false,
		lastDefArgs;

	// type detection
	function isArray(a) {
		return toString.call(a) == '[object Array]';
	}
	function isObject(o) {
		return typeof o === 'object' && !isArray(o);
	}

	// deep copy
	function deepCopy(src) {
		var tgt = isObject(src) ? {} : [];
		for (var prop in src) {
			if (src.hasOwnProperty(prop)) {
				var val = src[prop];
				tgt[prop] = (isArray(val) || isObject(val)) ? deepCopy(val) : val;
			};
		}
		return tgt;
	}

	// listen for require call
	require = function(deps) {
		origRequire(deps, function() {
			// auto-add all specs and stubs
			var specs = [], stubs = [],
				requireSpec = origRequire.config({
					context: 'spec',
					baseUrl: 'spec'
				}),
				requireStub = origRequire.config({
					context: 'stub',
					baseUrl: 'stub'
				});

			for (var path in moduleMap) {
				if (moduleMap.hasOwnProperty(path)) {
					specs.push(path + '.spec');
					stubs.push(path + '.stub');
				};
			}
			
			// add scrips to page (likely to result in many 404s, can this be fixed?)
			requireSpec(specs, noop);
			requireStub(stubs, noop);
		});
	};

	// listen for define call
	define = function() {
		var deps = (arguments.length > 1 && arguments[0]);
		lastDefArgs = [].slice.call(arguments)
		origDefine(deps, noop);
	};

	// listen for script load events
	origRequire.onScriptLoad = function(e) {
		var node = e.currentTarget,
			moduleName = e.currentTarget.getAttribute('data-requiremodule'),
			moduleContext = e.currentTarget.getAttribute('data-requirecontext'),
			map = (moduleContext === 'stub') ? stubMap : moduleMap;

		// tell requirejs the script has loaded
		origOnScriptLoad.apply(null, arguments);

		// don't store references to spec files
		if (moduleContext === 'spec') {
			return;
		}

		// clean module name
		moduleName = moduleName.replace(/\.stub$/i, '');

		// store module definition function and list of dependencies
		map[moduleName] = {
			module: lastDefArgs.pop(),
			deps: lastDefArgs.pop()
		}
	};

	// create modules on the fly with module map
	testr = function(moduleName, stubs, useExternal) {
		var depModules = [],
			moduleDef, module, deps, i;

		// check parameters
		if (typeof moduleName !== 'string') {
			throw Error('module name must be a string');
		}
		if (!useExternal && typeof stubs === 'boolean') {
			useExternal = stubs;
			stubs = {};
		} else if (stubs && !isObject(stubs)) {
			throw Error('stubs must be given as an object');
		}
		
		// get module definition from map
		moduleDef = (depLoad && useExternal && stubMap[moduleName]) || moduleMap[moduleName];
		if (!moduleDef) {
			throw Error('module has not been loaded: ' + moduleName);
		}

		// shortcuts
		module = moduleDef.module;
		deps = moduleDef.deps;

		// load up dependencies
		depLoad = true;
		if (deps) {
			for (i = 0; i < deps.length; i += 1) {
				var depName = deps[i],
					stub = stubs && stubs[depName];

				depModules.push(stub || testr(depName, stubs, useExternal));
			}
		}
		depLoad = false;

		// return clean instance of module
		return (typeof module === 'function') ? module.apply(null, depModules) : deepCopy(module);
	}

}());


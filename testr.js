var testr;

(function() {

	var origRequire = require,
		origDefine = define,
		origOnScriptLoad = require.onScriptLoad,
		noop = function() {},
		moduleMap = {},
		lastDefArgs;

	// tests
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
			// auto-add all specs
			var specs = [],
				requireSpec = origRequire.config({
					context: 'spec',
					baseUrl: 'spec'
				});

			for (var path in moduleMap) {
				if (moduleMap.hasOwnProperty(path)) {
					specs.push(path + '.spec');
				};
			}
			
			requireSpec(specs, noop);
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
			moduleName = e.currentTarget.getAttribute('data-requiremodule');

		// process
		moduleMap[moduleName] = {
			module: lastDefArgs.pop(),
			deps: lastDefArgs.pop()
		}

		// 
		origOnScriptLoad.apply(null, arguments);
	};

	// create modules on the fly with module map
	testr = function(moduleName, stubs) {
		var depModules = [],
			moduleDef, module, deps, i;

		// check input
		if (typeof moduleName !== 'string') {
			throw Error('module name must be a string');
		} else if(stubs && !isObject(stubs)) {
			throw Error('stubs must be given as an object');
		}
		
		// get module definition from map
		moduleDef = moduleMap[moduleName];
		if (!moduleDef) {
			throw Error('module has not been loaded: ' + moduleName);
		}

		// shortcuts
		module = moduleDef.module;
		deps = moduleDef.deps;

		// load up dependencies
		if (deps) {
			for (i = 0; i < deps.length; i += 1) {
				var depName = deps[i],
					stub = stubs && stubs[depName];

				depModules.push(stub || testr(depName, stubs));
			}
		}

		// return clean instance of module
		return (typeof module === 'function') ? module.apply(null, depModules) : deepCopy(module);
	}

}());


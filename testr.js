var testr, require, define;

(function() {

	var origRequire = require,
		origDefine = define,
		origOnScriptLoad = require.onScriptLoad,
		noop = function() {},
		moduleMap = {},
		stubMap = {},
		depLoad = false,
		lastDefArgs,
		autoLoad = ['spec', 'stub'];

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
			// auto load specs and stubs
			for (var i = 0; i < autoLoad.length; i += 1) {
				var type = autoLoad[i],
					paths = [],
					require = origRequire.config({
						context: type,
						baseUrl: type
					});

				for (var path in moduleMap) {
					if (moduleMap.hasOwnProperty(path)) {
						paths.push(path + '.' + type);
					}
				}

				require(paths, noop);
			}
		});
	};

	// listen for define call
	define = function() {
		var args = [].slice.call(arguments);
		lastDefArgs = [].slice.call(arguments);
		origDefine.apply(null, (args.splice(-1, 1, noop), args));
	};

	// listen for script load events
	origRequire.onScriptLoad = function(e) {
		var node = e.currentTarget,
			moduleName = node.getAttribute('data-requiremodule'),
			moduleContext = node.getAttribute('data-requirecontext'),
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


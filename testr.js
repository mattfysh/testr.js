var testr, require, define;

(function() {

	var origDefine = define,
		noop = function() {},
		moduleMap = {},
		stubMap = {},
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

	// override require
	require = function(deps) {
		requirejs(deps, function() {
			// auto load specs and stubs
			for (var i = 0; i < autoLoad.length; i += 1) {
				var type = autoLoad[i],
					paths = [],
					require = requirejs.config({
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

	// override define
	define = function() {
		var args = [].slice.call(arguments),
			factory = args.pop();

		// use module as a dependency to get the module id
		if(!args.length) {
			args.push([]);
		}
		args[0].unshift('module');

		// capture the call to define the function
		args.push(function(module) {
			// process any relative paths
			var deps = args[0].splice(1),
				i;

			for (i = 0; i < deps.length; i += 1) {
				if (deps[i].indexOf('./') === 0) {
					deps[i] = module.id.replace(/\/(.*)$/, deps[i].substring(1));
				}
			}

			// save the module
			saveModule(module, deps, factory);
		});

		// hook back into the loader
		origDefine.apply(null, args);
	};

	// save a module into the map
	function saveModule(module, deps, factory) {
		var moduleName = module.id,
			type = module.uri.split('/')[0],
			map;

		// adjust name and determine map to use
		if (type === 'stub') {
			moduleName = moduleName.replace(/\.stub$/i, '');
			map = stubMap;
		} else {
			map = moduleMap;
		}

		// store module definition function and list of dependencies
		map[moduleName] = {
			factory: factory,
			deps: deps
		}
	}

	// create modules on the fly with module map
	function buildModule(moduleName, stubs, useExternal, subject) {
		var depModules = [],
			moduleDef, factory, deps, i;

		// get module definition from map
		moduleDef = (!subject && useExternal && stubMap[moduleName]) || moduleMap[moduleName];
		if (!moduleDef) {
			throw Error('module has not been loaded: ' + moduleName);
		}

		// shortcuts
		factory = moduleDef.factory;
		deps = moduleDef.deps;

		// load up dependencies
		if (deps) {
			for (i = 0; i < deps.length; i += 1) {
				var depName = deps[i],
					stub = stubs && stubs[depName];

				depModules.push(stub || buildModule(depName, stubs, useExternal));
			}
		}

		// return clean instance of module
		return (typeof factory === 'function') ? factory.apply(null, depModules) : deepCopy(factory);
	}

	// define API
	testr = function(moduleName, stubs, useExternal) {
		// check module name
		if (typeof moduleName !== 'string') {
			throw Error('module name must be a string');
		}

		// check stubs
		if (!useExternal && typeof stubs === 'boolean') {
			useExternal = stubs;
			stubs = {};
		} else if (stubs && !isObject(stubs)) {
			throw Error('stubs must be given as an object');
		}

		// build the module under test
		return buildModule(moduleName, stubs, useExternal, true);
	}

}());


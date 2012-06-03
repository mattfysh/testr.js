var testr, define;

(function() {

	var origDefine = define,
		noop = function() {},
		moduleMap = {},
		pluginPaths = {};

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

	// each
	function each(items, callback) {
		if (!items) {
			return;
		}
		for (var i = 0; i < items.length; i += 1) {
			callback(items[i], i);
		}
	}

	// override define
	define = function() {
		var args = [].slice.call(arguments),
			factory = args.pop(),
			depPaths = ['module'],
			pluginLocs = [];

		// process the dependency ids
		each(args.pop(), function(path, index) {
			if (path.indexOf('!') > -1) {
				pluginPaths[path.split('!')[0]] = true;
				pluginLocs.push(index);
			}
			depPaths.push(path);
		});

		// rewrite the function that requirejs executes when defining the module
		function trojan(module) {
			var deps = [].slice.call(arguments, 1),
				isPlugin = pluginPaths[module.id],
				isStub = module.uri.indexOf('./stub') === 0;

 			if (isPlugin) {
 				// give requirejs the real plugin
 				return factory.apply(null, deps);
 			}

 			// alter plugin storage
 			each(pluginLocs, function(loc) {
 				var pluginLoaded = depPaths[loc + 1];
 				moduleMap[pluginLoaded] = deps[loc];
 				deps[loc] = pluginLoaded;
 			});

 			// save the module
			moduleMap[module.id] = {
				factory: factory,
				deps: deps
			}

			if (isStub) {
				// stub has been saved to module map, no further processing needed
				return;
			}

			// auto load associated files
			require({
				context: module.id,
				baseUrl: '.',
				deps: ['stub/' + module.id + '.stub', 'spec/' + module.id + '.spec']
			});

			// define the module as its path name, used by dependants
			return module.id;
		};

		// hook back into the loader with modified dependancy paths
		// to trigger dependency loading, and execute the trojan function
		origDefine(depPaths, trojan);
	};

	// create modules on the fly with module map
	function buildModule(moduleName, stubs, useExternal, subject) {
		var depModules = [],
			moduleDef, factory, deps;

		// get module definition from map
		moduleDef = (!subject && useExternal && moduleMap['stub/' + moduleName + '.stub']) || moduleMap[moduleName];
		if (!moduleDef) {
			throw Error('module has not been loaded: ' + moduleName);
		}

		// shortcuts
		factory = moduleDef.factory;
		deps = moduleDef.deps;

		// return plugin resolved dependencies immediately
		if (!factory) {
			return moduleDef;
		}

		// load up dependencies
		if (deps) {
			each(deps, function(depName) {
				var dep = stubs && stubs[depName] || buildModule(depName, stubs, useExternal);
				depModules.push(dep);
			});
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

/**
 * testr.js 1.0.1
 * https://www.github.com/mattfysh/testr.js
 * Distributed under the MIT license
 */

var testr, define;

(function() {

	var origDefine = define,
		noop = function() {},
		moduleMap = {},
		pluginPaths = {},
		config = {
			autoLoad: true
		};

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
			deps = args.pop(),
			name = args.pop(),
			depPaths = ['module'],
			pluginLocs = [],
			exportsLocs = [];

		// account for signature variation
		if (typeof deps === 'string') {
			name = deps;
			deps = [];
		}

		// process the dependency ids
		each(deps, function(path, index) {
			if (path.indexOf('!') > -1) {
				pluginPaths[path.split('!')[0]] = true;
				pluginLocs.push(index);
			} else if (path === 'exports') {
				exportsLocs.push(index);
			}
			depPaths.push(path);
		});

		// rewrite the function that requirejs executes when defining the module
		function trojan(module) {
			var deps = [].slice.call(arguments, 1);

 			if (!module || pluginPaths[module.id]) {
 				// jquery or plugin, give requirejs the real module
 				return (typeof factory === 'function') ? factory.apply(null, deps) : factory;
 			}

 			// alter plugin storage
 			each(pluginLocs, function(loc) {
 				deps[loc] = depPaths[loc + 1];
 			});

 			// alter exports deps
 			each(exportsLocs, function(loc) {
 				deps[loc] = 'exports';
 			});

 			// save the module
			moduleMap[module.id] = {
				factory: factory,
				deps: deps
			}

			if (module.uri.indexOf('./stub') === 0) {
				// stub has been saved to module map, no further processing needed
				return;
			}

			// auto load associated files
			if (config.autoLoad) {
				require({
					context: module.id,
					baseUrl: '.',
					deps: ['stub/' + module.id + '.stub', 'spec/' + module.id + '.spec']
				});
			}
			
			// define the module as its path name, used by dependants
			return module.id;
		};

		// hook back into the loader with modified dependancy paths
		// to trigger dependency loading, and execute the trojan
		if (name) {
			origDefine(name, depPaths, trojan);
			require([name]); // force requirejs to load the module immediately and call the trojan
		} else {
			origDefine(depPaths, trojan);
		}
	};

	// copy amd properties
	define.amd = origDefine.amd;

	// create new modules with the factory
	function buildModule(moduleName, stubs, useExternal, subject) {
		var depModules = [],
			exports = {},
			moduleDef, factory, deps;

		// get module definition from map
		moduleDef = (!subject && useExternal && moduleMap['stub/' + moduleName + '.stub']) || moduleMap[moduleName];
		if (!moduleDef) {
			// module may be stored in requirejs, e.g. plugin-loaded dependencies
			try {
				return require(moduleName);
			} catch(e) {
				throw new Error('module has not been loaded: ' + moduleName);
			}
		}

		// shortcuts
		factory = moduleDef.factory;
		deps = moduleDef.deps;

		// load up dependencies
		each(deps, function(depName) {
			// determine what to pass to the factory
			var dep = (depName === 'exports') ?
						exports :
						(stubs && stubs[depName]) ?
							stubs[depName] :
							buildModule(depName, stubs, useExternal);

			// add dependency to array
			depModules.push(dep);
		});

		if (typeof factory !== 'function') {
			// return clean copy of module object
			return deepCopy(factory);
		} else {
			// return clean instance of module
			return factory.apply(exports, depModules) || exports;
		}
	}

	// testr API
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

	// testr config
	testr.config = function(userConfig) {
		for (var p in userConfig) {
			if (userConfig.hasOwnProperty(p)) {
				config[p] = userConfig[p];
			};
		}
	}

}());

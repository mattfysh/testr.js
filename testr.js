/**
 * testr.js 1.1.0
 * https://www.github.com/mattfysh/testr.js
 * Distributed under the MIT license
 */

var testr, define;

(function() {
	var version = '1.1.0',
		origDefine = define,
		cjsRequireRegExp = /require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
		noop = function() {},
		moduleMap = {},
		pluginPaths = {},
		config = {
			autoLoad: false,
			specUrl: 'spec',
			stubUrl: 'stub'
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
		each(src, function(val, key) {
			tgt[key] = (isArray(val) || isObject(val)) ? deepCopy(val) : val;
		});
		return tgt;
	}

	// each
	function each(items, callback) {
		if (!items) {
			return;
		} else if (typeof items.length === 'number') {
			for (var i = 0; i < items.length; i += 1) {
				callback(items[i], i);
			}
		} else if (isObject(items)) {
			for (var prop in items) {
				if (items.hasOwnProperty(prop)) {
					callback(items[prop], prop);
				}
			}
		}
	}

	// normalize paths
	function normalize(path, contextReq) {
		var baseUrl = require.toUrl('.').replace(/\.$/, '');
		if (path.indexOf('!') === -1) {
			// regular path
			return contextReq(path);
		} else {
			// plugin
			path = path.split('!');
			if (path[1]) {
				path[1] = contextReq.toUrl(path[1]).substring(baseUrl.length);
			}
			return path.join('!');
		}
	}

	// override define
	define = function() {
		var args = [].slice.call(arguments),
			factory = args.pop(),
			deps = args.pop(),
			name = args.pop(),
			depPaths = ['require', 'module'],
			extractedPaths = [],
			pluginLocs = [],
			exportsLocs = [],
			requireLocs = [],
			wrap = !deps && typeof factory === 'function',
			defineArgs;

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
			} else if (path === 'require') {
				requireLocs.push(index);
			}
			depPaths.push(path);
		});

		// find cjs wrapped require calls
		if (!deps) {
			factory.toString().replace(cjsRequireRegExp, function (match, dep) {
				extractedPaths.push(dep);
			});
		}
		

		// rewrite the function that requirejs executes when defining the module
		function trojan(contextReq, module) {
			var offset = 2,
				deps = [].slice.call(arguments, offset);

 			if (!module || pluginPaths[module.id]) {
 				// jquery or plugin, give requirejs the real module
 				return (typeof factory === 'function') ? factory.apply(null, deps) : factory;
 			}

 			// alter plugin storage
 			each(pluginLocs, function(loc) {
 				// normalize path names
 				var path = depPaths[loc + offset];
 				deps[loc] = normalize(path, contextReq);
 			});

 			// alter exports deps
 			each(exportsLocs, function(loc) {
 				deps[loc] = 'exports';
 			});

 			// alter require deps
 			each(requireLocs, function(loc) {
 				deps[loc] = 'require';
 			});

 			// save the module
			moduleMap[module.id] = {
				factory: factory,
				deps: wrap ? ['require', 'exports'] : deps,
				require: contextReq
			};

			if (module.uri.indexOf('./'+config.stubUrl) === 0) {
				// stub has been saved to module map, no further processing needed
				return;
			}

			// auto load associated files
			if (config.autoLoad) {
				var autoDeps = [];
				var loadAll = typeof config.autoLoad === 'boolean' || config.autoLoad === 'all';

				if (loadAll || config.autoLoad === "stub") {
					autoDeps.push(config.stubUrl + '/' + module.id + '.stub')
				}
				if (loadAll || config.autoLoad === "spec") {
					autoDeps.push(config.specUrl + '/' + module.id + '.spec')
				}

				require({
					context: module.id,
					baseUrl: '.',
					deps: autoDeps
				});
			}
			
			// define the module as its path name, used by dependants
			return module.id;
		};

		// hook back into the loader with modified dependancy paths
		// to trigger dependency loading, and execute the trojan
		if (extractedPaths.length) {

		}
		defineArgs = [depPaths.concat(extractedPaths), trojan];
		name && defineArgs.unshift(name);
		origDefine.apply(null, defineArgs);
		name && require([name]); // force requirejs to load the module immediately and call the trojan
	};

	// copy amd properties
	define.amd = origDefine.amd;

	// allow restoration of original define function
	define.restore = function() {
		window.define = origDefine;
	}

	// create new modules with the factory
	function buildModule(moduleName, stubs, useExternal, subject, whitelistExceptions) {
		var depModules = [],
			exports = {},
			mustBeStubbed = config.whitelist && config.whitelist.length,
			moduleDef, externalStub, factory, deps, contextReq,
			getModule = function(depName) {
				return stubs && stubs[depName] || buildModule(depName, stubs, useExternal, false, whitelistExceptions);
			};

		// get external stub
		externalStub = !subject && useExternal && moduleMap[config.stubUrl + '/' + moduleName + '.stub'];

		// throw error if module must be stubbed
		if (mustBeStubbed && !subject && !externalStub) {
			each(config.whitelist, function(allowedActual) {
				if (moduleName === allowedActual) {
					mustBeStubbed = false;
				}
			});
			if (mustBeStubbed) {
				whitelistExceptions.push(moduleName);
				return {};
			}
		}

		// get module definition from map
		moduleDef = externalStub || moduleMap[moduleName];
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
		contextReq = moduleDef.require;

		// normalize stubs object paths on first call
		if (subject) {
			each(stubs, function(stub, path) {
				var nPath = normalize(path, contextReq);
				if (nPath !== path) {
					stubs[nPath] = stub;
					delete stubs[path];
				}
			});
		}

		// load up dependencies
		each(deps, function(dep) {
			// determine what to pass to the factory
			if (dep == 'exports') {
				dep = exports;
			} else if (dep === 'require') {
				dep = function(path) {
					return getModule(normalize(path, contextReq));
				};
			} else {
				dep = getModule(dep);
			}

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
		var whitelistExceptions = [],
			module, plural;

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
		module = buildModule(moduleName, stubs, useExternal, true, whitelistExceptions);

		// throw error if not all required stubs provided
		if (whitelistExceptions.length) {
			plural = (whitelistExceptions.length > 1) ? 's' : ''
			throw Error('module' + plural + ' must be stubbed: ' + whitelistExceptions.join(', '));
		}

		// return the module
		return module;
	};

	// testr config
	testr.config = function(userConfig) {
		each(userConfig, function(val, key) {
			config[key] = val;
		});
	};

	// attach version
	testr.version = version;

}());

(function() {
	var baseUrl = 'src',
		paths = {
			'path': 'pathtarget',
			'sibling': '../sibling',
			'text': '../lib/plugins/require/text.' + (require.version === '1.0.8' ? '1.0.8' : '2.0.0'),
			'pluginobj': '../lib/plugins/require/pluginobj',
			'jquery': '../lib/jquery-1.7.2'
		},
		required = [],
		allLoaded = false,
		count = 0;

	function requireSet(set, callback) {
		required.push.apply(required, set);
		require(set, callback);
	}

	function checkLoaded() {
		count += 1;
		if (count === 2) {
			testrApp.onload();
		}
	}

	require.config({
		paths: paths,
		baseUrl: baseUrl
	});

	testr.config({
		autoLoad: true
	});

	// basic require
	requireSet(['fn', 'obj', 'hasdeps'], function() {
		// has dependency on obj
		requireSet(['require/uses'], function() {
			checkLoaded();
		});
	});

	// advanced
	requireSet(['plugins/uses', 'usejquery', 'cjs/wrap']);

	// advanced module names
	requireSet(['path', '../sibling/outsidebase', 'sibling/pathtarget', 'rename/def'], function() {
		// has dependency on rename/def
		requireSet(['rename/use'], function() {
			checkLoaded();
		});
	});

	// exports
	requireSet(['exports/uses', 'exports/returns']);

	// export the set of required modules
	window.testrApp = {
		required: required,
		paths: paths,
		baseUrl: baseUrl,
		onload: function() {}
	}

}());

(function() {
	var deps = [],
		config;

	// basic
	deps.push('fn', 'obj', 'hasdeps', 'lazy');
	// advanced
	deps.push('plugins/uses', 'usejquery', 'cjs/wrap');
	// module naming
	deps.push('path', '../sibling/outsidebase', 'sibling/pathtarget', 'rename/def');
	// exports
	deps.push('exports/uses', 'exports/returns');

	// require.js config object
	config = {
		baseUrl: 'src',
		paths: {
			'path': 'pathtarget',
			'sibling': '../sibling',
			'text': '../lib/plugins/require/text.2.0.0',
			'pluginobj': '../lib/plugins/require/pluginobj',
			'jquery': '../lib/jquery-1.7.2'
		},
		deps: deps,
		callback: function() {
			require(['require/uses', 'rename/use']);
		}
	}

	require(config);

	// export config
	window.rconf = {
		paths: config.paths,
		deps: config.deps
	};

}());

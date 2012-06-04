require.config({
	paths: {
		'path': 'pathtarget',
		'sibling': '../sibling',
		'text': '../lib/plugins/require/text.' + (require.version === '1.0.8' ? '1.0.8' : '2.0.0'),
		'pluginobj': '../lib/plugins/require/pluginobj'
	}
});

// basic require
require(['fn', 'obj', 'hasdeps', 'plugins']);

// advanced module names
require(['path', '../sibling/outsidebase', 'sibling/pathtarget', 'redef']);

// exports
require(['exports/uses', 'exports/returns']);
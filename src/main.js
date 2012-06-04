require.config({
	paths: {
		'path': 'pathtarget',
		'sibling': '../sibling',
		'text': '../lib/plugins/require/text.' + (require.version === '1.0.8' ? '1.0.8' : '2.0.0'),
		'pluginobj': '../lib/plugins/require/pluginobj',
		'jquery': '../lib/jquery-1.7.2'
	}
});

// basic require
require(['fn', 'obj', 'hasdeps', 'plugins', 'usejquery']);

// advanced module names
require(['path', '../sibling/outsidebase', 'sibling/pathtarget', 'rename/def', 'rename/use']);

// exports
require(['exports/uses', 'exports/returns']);
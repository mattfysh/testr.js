require.config({
	paths: {
		'path': 'pathtarget',
		'sibling': '../sibling',
		'text': '../lib/plugins/require/text.' + (require.version === '1.0.8' ? '1.0.8' : '2.0.0')
	}
});

// basic require
require(['fn', 'obj', 'hasdeps']);

// advanced module names
require(['path', '../sibling/outsidebase', 'sibling/pathtarget']);

// plugins
require(['needstext']);
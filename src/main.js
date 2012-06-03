require.config({
	paths: {
		'path': 'pathtarget',
		'sibling': '../sibling',
		'text': '../lib/plugins/require/text'
	}
});

// basic require
require(['fn', 'obj', 'hasdeps']);

// advanced module names
require(['path', '../sibling/outsidebase', 'sibling/pathtarget']);

// plugins
require(['needstext']);
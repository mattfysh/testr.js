require.config({
	urlArgs: 'bust=' + Date.now()
});
require(['app'], function(app) {
	app.initialize();
});
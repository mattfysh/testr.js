define(['realdep1', 'realdep2'], function(realDep1, realDep2) {

	return {
		initialize: function() {
			console.log('app init running');
		},
		addDeps: function() {
			return realDep1.getValue() + realDep2.getValue();
		}
	}

});
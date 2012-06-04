describe('testr', function() {

	it('doesnt execute modules during loading', function() {
		// as they may pollute other modules, or scopes
		expect(window.polluted).toBeUndefined();
	});

	describe('function', function() {

		var module;

		beforeEach(function() {
			module = testr('fn');
		});

		it('returns a module', function() {
			expect(module).toBeDefined();
		});

		it('returns the requested module', function() {
			expect(module.functionDef).toBe(true);
		});

		it('prevents pollution on module', function() {
			module.polluted = true;
			module = testr('fn');
			expect(module.polluted).toBeUndefined();
		});

		it('prevents pollution in module closure', function() {
			module.polluteVal();
			expect(module.getVal()).toBe('polluted');
			module = testr('fn');
			expect(module.getVal()).toBe('unpolluted');
		});

	});

	describe('object', function() {

		var module;

		beforeEach(function() {
			module = testr('obj');
		});

		it('returns the requested module', function() {
			expect(module.objectDef).toBe(true);
		});

		it('prevents pollution', function() {
			module.polluted = true;
			module = testr('obj');
			expect(module.polluted).toBeUndefined();
		});

	});

	describe('function with exports', function() {

		it('uses exports object as module', function() {
			module = testr('exports/uses');
			expect(module.useExport).toBe(true);
		});

		it('always uses return value if it exists', function() {
			module = testr('exports/returns');
			expect(module.returnDefine).toBe(true);
			expect(module.exportsDefine).toBeUndefined();
		});

	})

	describe('directory modules', function() {

		it('can be grabbed directly', function() {
			var deepDep = testr('deeper/isdep');
			expect(deepDep.deep).toBe(true);
		});

		it('can be grabbed with the parent syntax', function() {
			var module = testr('../sibling/outsidebase');
			expect(module.outsideBase).toBe(true);
		});

	});

	describe('plugins', function() {

		it('takes full control of dependency resolution', function() {
			var module = testr('plugins');
			expect(module.template).toBe('<div>{{content}}</div>');
		});

		it ('can be stubbed', function() {
			var module = testr('plugins', {
				'text!template.html': 'stubbed'
			});
			expect(module.template).toBe('stubbed');
		});

		it('can be an object', function() {
			var module = testr('plugins');
			expect(module.asObjDep).toBe('plugin object loaded');
		});

	});

	describe('renamed modules', function() {
		
		it('uses defined name', function() {
			var origModule = testr('rename/def'),
				module = testr('newdefname');

			expect(origModule).toBeFalsy();
			expect(module.redefined).toBe(true);
		});

		it('can be pulled in as real deps', function() {
			var module = testr('rename/use');
			expect(module.dep.redefined).toBe(true);
		});

		it('can be stubbed in the stub object', function() {
			var module = testr('rename/use', {
				'newdefname': 'stubbed'
			});
			expect(module.dep).toBe('stubbed');
		});

		it('can be externally stubbed', function() {
			var module = testr('rename/use', true);
			expect(module.dep.isExternalStub).toBe(true);
		});

	});

	describe('jquery', function() {

		it('can be used', function() {
			var module = testr('usejquery'),
				heading = module.getHeading();
			expect(heading.text()).toContain('Jasmine Spec Runner');
		});

		it('can be stubbed', function() {
			var called = false;
				module = testr('usejquery', {
					'jquery': function() {
						return 'stubbed'
					}
				}),
				heading = module.getHeading();
				
			expect(heading).toBe('stubbed');
		})

	});

});
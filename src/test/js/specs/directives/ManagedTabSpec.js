describe('Directive: ManagedTab', function() {
    var $compile,
        $rootScope,
        $templateCache;

    beforeEach(module('profileEditor'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$templateCache_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache = _$templateCache_;
    }));

    it('will save content nested in a managed-tab to the template cache', function() {
        var managedTabContent = '<span>This is the tab contents</span>';
        // Compile a piece of HTML containing the directive
        var element = $compile("<tabset><tab>The first tab is active by default</tab><tab managed-tab>"+managedTabContent+"</tab></tabset>")($rootScope);

        expect($templateCache.get('managed-tab-template-1')).toEqual(managedTabContent);
    });

    it('will replace the tab contents with an ng-include and a loading indicator', function() {
        var managedTabContent = 'This is the tab contents';
        // Compile a piece of HTML containing the directive.  Note that the first tab will be made active during
        // the digest cycle so we have to use the second tab for our test.
        var element = $compile("<tabset><tab>The first tab is active by default</tab><tab managed-tab><span>"+managedTabContent+"</span></tab></tabset>")($rootScope);

        $rootScope.$digest();

        // The tabset / tab directive template will create tabs with the classes below. The lazy tab is the second
        // tab in this case.
        var managedTabContentNode = element.find(".tab-content .tab-pane")[1];

        expect(managedTabContentNode.innerHTML).toContain('<span class="fa fa-spin fa-spinner"></span>');
        expect(managedTabContentNode.innerHTML).not.toContain(managedTabContent);
    });

    it('will replace text content with an ng-include and a loading indicator', function() {
        var managedTabContent = 'This is the tab contents';
        // Compile a piece of HTML containing the directive.  Note that the first tab will be made active during
        // the digest cycle so we have to use the second tab for our test.
        var element = $compile("<tabset><tab>The first tab is active by default</tab><tab managed-tab>"+managedTabContent+"</tab></tabset>")($rootScope);

        expect($templateCache.get('managed-tab-template-1')).toEqual(managedTabContent);

        $rootScope.$digest();

        // The tabset / tab directive template will create tabs with the classes below. The lazy tab is the second
        // tab in this case.
        var managedTabContentNode = element.find(".tab-content .tab-pane")[1];

        expect(managedTabContentNode.innerHTML).toContain('<span class="fa fa-spin fa-spinner"></span>');
        expect(managedTabContentNode.innerHTML).not.toContain(managedTabContent);
    });

    it('will load the tab contents when the tab is made active', function() {

        var managedTabContent = 'This is the tab contents';
        // Compile a piece of HTML containing the directive.  Note that the first tab will be made active during
        // the digest cycle so we have to use the second tab for our test.
        var element = $compile("<tabset><tab>The first tab is active by default</tab><tab managed-tab><span>"+managedTabContent+"</span></tab></tabset>")($rootScope);

        $rootScope.$digest();

        // The tabset / tab directive template will create tabs with the classes below. The lazy tab is the second
        // tab in this case.
        var managedTabContentNode = element.find(".tab-content .tab-pane")[1];

        expect(managedTabContentNode.innerHTML).toContain('<span class="fa fa-spin fa-spinner"></span>');
        expect(managedTabContentNode.innerHTML).not.toContain(managedTabContent);

        // Now activate the tab
        element.find('.nav-tabs a')[1].click();
        $rootScope.$digest();

        managedTabContentNode = element.find(".tab-content .tab-pane")[1];

        expect(managedTabContentNode.innerHTML).toContain(managedTabContent);
        expect(managedTabContentNode.innerHTML).not.toContain('<span class="fa fa-spin fa-spinner"></span>');

    });

    it('will not prevent the tab select callback from being made', function() {

        var scope = $rootScope.$new();
        scope.select = jasmine.createSpy();

        var managedTabContent = 'This is the tab contents';
        // Compile a piece of HTML containing the directive.  Note that the first tab will be made active during
        // the digest cycle so we have to use the second tab for our test.
        var element = $compile("<tabset><tab>The first tab is active by default</tab><tab managed-tab select='select()'><span>"+managedTabContent+"</span></tab></tabset>")(scope);

        $rootScope.$digest();

        // Now activate the tab
        element.find('.nav-tabs a')[1].click();
        $rootScope.$apply();

        expect(scope.select).toHaveBeenCalled();
    });

});
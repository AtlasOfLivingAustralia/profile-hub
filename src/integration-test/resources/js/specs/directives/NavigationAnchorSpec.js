describe('Directive: NavigationAnchor', function() {
    var $compile,
        $rootScope,
        navService;


    beforeEach(module('profileEditor'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _navService_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        navService = _navService_;
    }));

    it('will render an anchor tag', function() {
        var content = '<navigation-anchor anchor-name="key" title="Label"></navigation-anchor>';
        // Compile a piece of HTML containing the directive
        var element = $compile(content)($rootScope);
        $rootScope.$apply();

        expect(element[0].tagName).toBe('A');
        expect(element.attr('name').trim()).toBe('key');

    });

    it('will register itself with the navService', function() {
        var content = '<navigation-anchor anchor-name="key" title="Label"></navigation-anchor>';
        // Compile a piece of HTML containing the directive
        var element = $compile(content)($rootScope);
        $rootScope.$apply();

        expect($rootScope.nav).toEqual([{label:"Label", key:"key", anchor:"key", category:undefined, tab:undefined}]);

    });


    it('will conditionally register itself with the navService based on the condition attribute', function() {
        $rootScope.condition = false;
        var content = '<navigation-anchor anchor-name="key" title="Label" condition="condition"></navigation-anchor>';
        // Compile a piece of HTML containing the directive
        var element = $compile(content)($rootScope);
        $rootScope.$apply();

        $rootScope.condition = true;
        $rootScope.$apply();

        expect($rootScope.nav).toEqual([{label:"Label", key:"key", anchor:"key", category:undefined, tab:undefined}]);

    });

    it('will register itself with the nav service under the correct tab', function() {
        var content = '<tabset><tab managed-tab heading="Tab"><navigation-anchor anchor-name="key" title="Label"></navigation-anchor></tab></tabset>';
        // Compile a piece of HTML containing the directive
        var element = $compile(content)($rootScope);
        $rootScope.$apply();

        expect($rootScope.nav[0].tab).toEqual("Tab");
    });

    it("will strip anchor prefixes of view_ to make a more predicable key for explicit registration but still have descriptive anchors", function() {
        var content = '<navigation-anchor anchor-name="view_key" title="Label"></navigation-anchor>';
        // Compile a piece of HTML containing the directive
        var element = $compile(content)($rootScope);
        $rootScope.$apply();

        expect($rootScope.nav).toEqual([{
            label: "Label",
            key: "key",
            anchor: "view_key",
            category: undefined,
            tab: undefined
        }]);
    });


    it("will strip anchor prefixes of edit_ to make a more predicable key for explicit registration but still have descriptive anchors", function() {
        var content = '<navigation-anchor anchor-name="edit_key" title="Label"></navigation-anchor>';
        // Compile a piece of HTML containing the directive
        var element = $compile(content)($rootScope);
        $rootScope.$apply();

        expect($rootScope.nav).toEqual([{label:"Label", key:"key", anchor:"edit_key", category:undefined, tab:undefined}]);
    });

});
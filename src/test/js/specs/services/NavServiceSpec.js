describe("NavService spec", function () {
    var service;
    var rootScope;

    beforeAll(function () {
        console.log("****** Nav Service Tests ******")
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function (_navService_, _$rootScope_) {
        service = _navService_;
        rootScope = _$rootScope_;
    }));

    it("should make a navigation item available in the $rootScope when registered", function () {
        service.add("Label", "key", "view_key", "category", "tab");

        expect(rootScope.nav).toEqual([{label:"Label", key:"key", anchor:"view_key", category:"category", tab:"tab", onDisplay:undefined}]);
    });

    it("can remove a navigation item by key after it has been added", function() {
        service.add("Label", "key", "view_key", "category", "tab");
        service.remove("key");

        expect(rootScope.nav).toEqual([]);
    });

    it("will invoke the onDisplay callback when a nav item on a tab is first displayed", function() {
        var callbackInvoked = false;
        service.registerTab("tab", function(){}, function(){});
        service.add("Label", "key", "view_key", "category", "tab", function(){callbackInvoked = true;});

        expect(callbackInvoked).toBe(false);

        service.tabSelected("tab");

        expect(callbackInvoked).toBe(true);
    });

    it("will invoke the onDisplay callback immediately when a nav item without a tab is registered", function() {
        var callbackInvoked = false;
        service.registerTab("tab", function(){}, function(){});
        service.add("Label", "key", "view_key", "category", undefined, function(){callbackInvoked = true;});

        expect(callbackInvoked).toBe(true);
    });

    it("will select the tab before scrolling when requested to navigate to an item on a tab", function() {
        var tabSelected = false;
        service.registerTab("tab", function(){tabSelected = true; return {then:function() {}}}, function(){});
        service.add("Label", "key", "view_key", "category", "tab");

        service.navigateTo("key");

        expect(tabSelected).toBe(true);

    });


});


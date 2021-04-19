describe('Directive: DelegatedSearch', function () {
    var scope, compile;
    var validTemplate = '<delegated-search></delegated-search>';

    var util, sessionStorage;

    beforeAll(function () {
        console.log("****** DelegatedSearch Directive Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        module('profileEditor');

        inject(function ($compile, $rootScope, _$sessionStorage_, _util_) {
            var testScope = $rootScope.$new();
            compile = $compile;
            util = _util_;

            sessionStorage = _$sessionStorage_;
            // make sure session-level values are cleared between tests
            delete sessionStorage.delegatedSearches;

            spyOn(util, "redirect").and.stub();

            var element = angular.element(validTemplate);
            $compile(element)(testScope);

            testScope.$digest();
            scope = element.isolateScope();
        });

        scope.$digest();
    });

    it("should do nothing when search is invoked with a null searchTerm", function() {
        spyOn(util, "getEntityId").and.returnValue("opusId1");

        scope.delSearchCtrl.searchTerm = null;
        scope.delSearchCtrl.search();
        scope.$digest();

        expect(sessionStorage.delegatedSearches).toBeUndefined();
    });

    it("should do nothing when search is invoked with a blank searchTerm", function() {
        spyOn(util, "getEntityId").and.returnValue("opusId1");

        scope.delSearchCtrl.searchTerm = "    ";
        scope.delSearchCtrl.search();
        scope.$digest();

        expect(sessionStorage.delegatedSearches).toBeUndefined();
    });

    it("should do nothing when search is invoked with an undefined searchTerm", function() {
        spyOn(util, "getEntityId").and.returnValue("opusId1");

        scope.delSearchCtrl.searchTerm = undefined;
        scope.delSearchCtrl.search();
        scope.$digest();

        expect(sessionStorage.delegatedSearches).toBeUndefined();
    });

    it("should populate the delegatedSearches object of the sessionStorage for the current opus when search is invoked", function() {
        spyOn(util, "getEntityId").and.returnValue("opusId1");

        scope.delSearchCtrl.searchTerm = "test";
        scope.delSearchCtrl.search();
        scope.$digest();

        expect(sessionStorage.delegatedSearches).toEqual({"opusId1": {term: "test", "searchOptions": { matchAll: true, nameOnly: false, includeNameAttributes: true}}});
    });

    it("should populate the delegatedSearches object of the sessionStorage for the 'all' search when search is invoked and there is no opus", function() {
        spyOn(util, "getEntityId").and.returnValue(null);

        scope.delSearchCtrl.searchTerm = "test";
        scope.delSearchCtrl.search();
        scope.$digest();

        expect(sessionStorage.delegatedSearches).toEqual({"all": {term: "test", "searchOptions": { matchAll: true, nameOnly: false, includeNameAttributes: true}}});
    });

    it("should redirect to the opus home page when searching within an opus", function() {
        spyOn(util, "getEntityId").and.returnValue("opusId1");

        scope.delSearchCtrl.searchTerm = "test";
        scope.delSearchCtrl.search();
        scope.$digest();

        expect(util.redirect).toHaveBeenCalledWith("/path/opus/opusId1/search");
    });

    it("should redirect to the general collections search page when searching outside an opus", function() {
        spyOn(util, "getEntityId").and.returnValue(null);

        scope.delSearchCtrl.searchTerm = "test";
        scope.delSearchCtrl.search();
        scope.$digest();

        expect(util.redirect).toHaveBeenCalledWith("/path/opus/search");
    });

});
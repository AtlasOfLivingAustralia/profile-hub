describe("SearchController tests", function () {
    var controller;
    var scope;

    var sessionStorage;
    var profileService;
    var messageService;
    var util;
    var searchDefer, imageDefer;

    beforeAll(function () {
        console.log("****** Search Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, $q, $sessionStorage, _util_, _profileService_, _messageService_) {
        scope = $rootScope.$new();

        searchDefer = $q.defer();
        imageDefer = $q.defer();

        profileService = _profileService_;
        util = _util_;
        sessionStorage = $sessionStorage;
        // make sure session-level values are cleared between tests
        delete sessionStorage.delegatedSearches;
        delete sessionStorage.searches;

        spyOn(profileService, "search").and.returnValue(searchDefer.promise);
        spyOn(profileService, "getPrimaryImage").and.returnValue(imageDefer.promise);

        spyOn(util, "getEntityId").and.returnValue("opus1");

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("SearchController as searchCtrl", {
            $scope: scope,
            profileService: profileService,
            util: util,
            messageService: messageService,
            $sessionStorage: sessionStorage
        });

        // search is called when the controller is created if there are no existing results, which affects the call
        // counts for tests that are checking specific function calls below, so we reset the number here.
        profileService.search.calls.reset();
    }));

    it("should default the offset and page size when search is invoked with no values", function () {
        scope.searchCtrl.searchTerm = "test";
        scope.searchCtrl.search();

        expect(profileService.search).toHaveBeenCalledWith("opus1", "test", { matchAll: true, nameOnly: false, includeNameAttributes: false, searchAla: true, searchNsl: true, hideStubs:true, offset: 0, pageSize: 25});
    });

    it("should use the provided offset and page size when search is invoked with values", function () {
        scope.searchCtrl.searchTerm = "test";
        scope.searchCtrl.search(6, 66);

        expect(profileService.search).toHaveBeenCalledWith("opus1", "test", { matchAll: true, nameOnly: false, includeNameAttributes: false, searchAla: true, searchNsl: true, hideStubs:true, offset: 66, pageSize: 6});
    });

    it("should do invoke the search service with an empty search time if self.searchTerm is null", function() {
        var results = {items: [{name: "item1"}, {name: "item2"}]};
        searchDefer.resolve(results);

        scope.searchCtrl.search();
        scope.$apply();

        expect(profileService.search).toHaveBeenCalledWith("opus1", "", { matchAll: true, nameOnly: false, includeNameAttributes: false, searchAla: true, searchNsl: true, hideStubs:true, offset: 0, pageSize: 25});
    });

    it("should raise an alert message if the call to search fails", function () {
        searchDefer.reject();
        scope.searchCtrl.searchTerm = "term";
        scope.searchCtrl.search();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("it should set the status attribute (used for image loading) to 'not-checked' for new search results", function () {
        var results = {items: [{name: "item1"}, {name: "item2"}]};
        searchDefer.resolve(results);

        scope.searchCtrl.searchTerm = "term";
        scope.searchCtrl.search();
        scope.$apply();

        var count = 0;
        angular.forEach(scope.searchCtrl.searchResults.items, function (item) {
            expect(item.image.status).toBe("not-checked");
            count++;
        });
        expect(count).toBe(2);
    });

    it("it should set the status attribute (used for image loading) to 'checked' and populate url and type when loadImageForProfile succeeds", function () {
        scope.searchCtrl.searchResults = {
            items: [{uuid: "item1", image: {status: "not-checked"}}, {
                uuid: "item2",
                image: {status: "not-checked"}
            }]
        };
        imageDefer.resolve({thumbnailUrl: "url1", type: "imageType"});

        scope.searchCtrl.loadImageForProfile("item1");
        scope.$apply();

        expect(profileService.getPrimaryImage).toHaveBeenCalled();
        expect(scope.searchCtrl.searchResults.items[0].image.url).toBe("url1");
        expect(scope.searchCtrl.searchResults.items[0].image.type).toBe("imageType");
        expect(scope.searchCtrl.searchResults.items[0].image.status).toBe("checked");
    });

    it("it should not look up the primary image if the status is not 'not-checked'", function () {
        scope.searchCtrl.searchResults = {
            items: [{uuid: "item1", image: {status: "checked"}}, {
                uuid: "item2",
                image: {status: "checked"}
            }]
        };
        imageDefer.resolve({thumbnailUrl: "url1", type: "imageType"});

        scope.searchCtrl.loadImageForProfile("item1");
        scope.$apply();

        expect(profileService.getPrimaryImage).not.toHaveBeenCalled();
    });

    it("should clear the search term, results and cache when clearSearch is called (no opus)", function () {
        scope.searchCtrl.opusId = null;

        sessionStorage.searches = {
            "all": {
                items: [{uuid: "item1", image: {status: "not-checked"}}, {
                    uuid: "item2",
                    image: {status: "not-checked"}
                }]
            },
            "opus1": {
                items: [{uuid: "item3", image: {status: "not-checked"}}, {
                    uuid: "item4",
                    image: {status: "not-checked"}
                }]
            }
        };
        scope.searchCtrl.searchTerm = "term";
        scope.searchCtrl.searchResults = {
            items: [{uuid: "item1", image: {status: "not-checked"}}, {
                uuid: "item2",
                image: {status: "not-checked"}
            }]
        };

        scope.searchCtrl.clearSearch();

        expect(sessionStorage.searches["all"]).toEqual({});
        expect(sessionStorage.searches["opus1"]).toEqual({
            items: [{
                uuid: "item3",
                image: {status: "not-checked"}
            }, {uuid: "item4", image: {status: "not-checked"}}]
        });
        expect(scope.searchCtrl.searchTerm).toEqual("");
        expect(scope.searchCtrl.searchResults).toEqual({});
    });

    it("should clear the search term, results and cache when clearSearch is called (with opus)", function () {
        scope.searchCtrl.opusId = "opus1";

        sessionStorage.searches = {
            "all": {
                items: [{uuid: "item1", image: {status: "not-checked"}}, {
                    uuid: "item2",
                    image: {status: "not-checked"}
                }]
            },
            "opus1": {
                items: [{uuid: "item3", image: {status: "not-checked"}}, {
                    uuid: "item4",
                    image: {status: "not-checked"}
                }]
            }
        };
        scope.searchCtrl.searchTerm = "term";
        scope.searchCtrl.searchResults = {
            items: [{uuid: "item1", image: {status: "not-checked"}}, {
                uuid: "item2",
                image: {status: "not-checked"}
            }]
        };

        scope.searchCtrl.clearSearch();

        expect(sessionStorage.searches["all"]).toEqual({
            items: [{
                uuid: "item1",
                image: {status: "not-checked"}
            }, {uuid: "item2", image: {status: "not-checked"}}]
        });
        expect(sessionStorage.searches["opus1"]).toEqual({});
        expect(scope.searchCtrl.searchTerm).toEqual("");
        expect(scope.searchCtrl.searchResults).toEqual({});
    });

    it("it should cache results against the 'all' key when there is no opus", function () {
        scope.searchCtrl.opusId = null;
        scope.searchCtrl.searchTerm = "test";

        var results = {items: [{name: "item1"}, {name: "item2"}]};
        searchDefer.resolve(results);

        scope.searchCtrl.search();
        scope.$apply();

        expect(sessionStorage.searches.all.result).toEqual({
            items: [{
                name: "item1",
                image: {status: "not-checked", type: {}}
            }, {name: "item2", image: {status: "not-checked", type: {}}}]
        });
        expect(sessionStorage.searches.all.term).toEqual("test");
        expect(sessionStorage.searches.all.options).toEqual({ matchAll: true, nameOnly: false, includeNameAttributes: false, searchAla: true, searchNsl: true, hideStubs: true, offset: 0, pageSize: 25});
    });

    it("it should cache results against the opusId when there is an opus", function () {
        scope.searchCtrl.opusId = "opus1";
        scope.searchCtrl.searchTerm = "test";

        var results = {items: [{name: "item1"}, {name: "item2"}]};
        searchDefer.resolve(results);

        scope.searchCtrl.search();
        scope.$apply();

        expect(sessionStorage.searches.opus1.result).toEqual({
            items: [{
                name: "item1",
                image: {status: "not-checked", type: {}}
            }, {name: "item2", image: {status: "not-checked", type: {}}}]
        });
        expect(sessionStorage.searches.opus1.term).toEqual("test");
        expect(sessionStorage.searches.opus1.options).toEqual({ matchAll: true, nameOnly: false, includeNameAttributes: false, searchAla: true, searchNsl: true, hideStubs: true, offset: 0, pageSize: 25});
    });

    it("should populate the search results from the cache when retrieveCachedOrDelegatedSearch is invoked (no opus)", function () {
        scope.searchCtrl.opusId = null;

        sessionStorage.searches = {
            all: {
                result: {
                    items: [
                        {name: "item1", image: {status: "not-checked", type: {}}},
                        {name: "item2", image: {status: "not-checked", type: {}}}
                    ]
                },
                term: "test",
                options: {nameOnly: false, offset: 6, pageSize: 66}
            },
            opus1: {
                result: {
                    items: [
                        {name: "item3", image: {status: "not-checked", type: {}}},
                        {name: "item4", image: {status: "not-checked", type: {}}}
                    ]
                },
                term: "test",
                options: {nameOnly: false, offset: 7, pageSize: 77}
            }
        };

        scope.searchCtrl.retrieveCachedOrDelegatedSearch();
        scope.$apply();

        expect(scope.searchCtrl.searchResults).toEqual({
            items: [{
                name: "item1",
                image: {status: "not-checked", type: {}}
            }, {name: "item2", image: {status: "not-checked", type: {}}}]
        });
        expect(scope.searchCtrl.searchTerm).toEqual("test");
        expect(scope.searchCtrl.searchOptions).toEqual({nameOnly: false, offset: 6, pageSize: 66});

        expect(profileService.search).not.toHaveBeenCalled();
    });

    it("should populate the search results from the cache when retrieveCachedOrDelegatedSearch is invoked (with opus)", function () {
        scope.searchCtrl.opusId = "opus1";

        sessionStorage.searches = {
            all: {
                result: {
                    items: [
                        {name: "item1", image: {status: "not-checked", type: {}}},
                        {name: "item2", image: {status: "not-checked", type: {}}}
                    ]
                },
                term: "test",
                options: {nameOnly: false, offset: 6, pageSize: 66}
            },
            opus1: {
                result: {
                    items: [
                        {name: "item3", image: {status: "not-checked", type: {}}},
                        {name: "item4", image: {status: "not-checked", type: {}}}
                    ]
                },
                term: "test",
                options: {nameOnly: false, offset: 7, pageSize: 77}
            }
        };

        scope.searchCtrl.retrieveCachedOrDelegatedSearch();
        scope.$apply();

        expect(scope.searchCtrl.searchResults).toEqual({
            items: [{
                name: "item3",
                image: {status: "not-checked", type: {}}
            }, {name: "item4", image: {status: "not-checked", type: {}}}]
        });
        expect(scope.searchCtrl.searchTerm).toEqual("test");
        expect(scope.searchCtrl.searchOptions).toEqual({nameOnly: false, offset: 7, pageSize: 77});

        expect(profileService.search).not.toHaveBeenCalled();
    });

    it("should invoke profileService.search with the delegated search term if a delegated Search exists when retrieveCachedOrDelegatedSearch is invoked (no opus)", function () {
        scope.searchCtrl.opusId = null;

        sessionStorage.delegatedSearches = {all: {term: "allSearch"}, opus1: {term: "opusSearch"}};

        scope.searchCtrl.retrieveCachedOrDelegatedSearch();
        scope.$apply();

        expect(profileService.search).toHaveBeenCalledWith(null, "allSearch", {
            matchAll: true,
            nameOnly: false,
            includeNameAttributes: false,
            searchAla: true,
            searchNsl: true,
            hideStubs: true,
            offset: 0,
            pageSize: 25
        });

        // the delegated search should be deleted
        expect(sessionStorage.delegatedSearches).toEqual({opus1: {term: "opusSearch"}});
    });

    it("should invoke profileService.search with the delegated search term if a delegated Search exists when retrieveCachedOrDelegatedSearch is invoked (no opus)", function () {
        scope.searchCtrl.opusId = "opus1";

        sessionStorage.delegatedSearches = {all: {term: "allSearch"}, opus1: {term: "opusSearch"}};

        scope.searchCtrl.retrieveCachedOrDelegatedSearch();
        scope.$apply();

        expect(profileService.search).toHaveBeenCalledWith("opus1", "opusSearch", {
            matchAll: true,
            nameOnly: false,
            includeNameAttributes: false,
            searchAla: true,
            searchNsl: true,
            hideStubs: true,
            offset: 0,
            pageSize: 25
        });

        // the delegated search should be deleted
        expect(sessionStorage.delegatedSearches).toEqual({all: {term: "allSearch"}});
    });
});
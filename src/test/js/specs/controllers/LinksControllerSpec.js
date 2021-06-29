describe("LinksController tests", function () {
    var controller;
    var scope;
    var mockUtil = {
        getPathItem: function () {
            return "12345"
        },
        getEntityId: function (str) {
            if (str == "opus") {
                return "opusId1"
            } else if (str == "profile") {
                return "profileId1"
            }
        },
        LAST: "last"
    };
    var messageService;
    var profileService;
    var profileDefer, saveLinksDefer;

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "links":[{},{}]}, "opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';

    beforeAll(function () {
        console.log("****** Links Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        profileDefer = $q.defer();
        saveLinksDefer = $q.defer();

        spyOn(profileService, "getProfile").and.returnValue(profileDefer.promise);
        spyOn(profileService, "updateLinks").and.returnValue(saveLinksDefer.promise);

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("LinksEditor as linkCtrl", {
            $scope: scope,
            profileService: profileService,
            util: mockUtil,
            messageService: messageService
        });
    }));

    it("should set the profile attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.linkCtrl.init("false");
        scope.$apply();

        expect(scope.linkCtrl.profile).toBeDefined();
    });

    it("should set the opus attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.linkCtrl.init("false");
        scope.$apply();

        expect(scope.linkCtrl.opus).toBeDefined();
    });

    it("should set the readonly flag to false when init is called with edit=false", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.linkCtrl.init("false");
        scope.$apply();

        expect(scope.linkCtrl.readonly).toBe(true);
    });

    it("should set the readonly flag to false when init is called with edit=true", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.linkCtrl.init("true");
        scope.$apply();

        expect(scope.linkCtrl.readonly).toBe(false);
    });

    it("should set the links array on the scope with the results from the getProfile call", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.linkCtrl.init("false");
        scope.$apply();

        expect(scope.linkCtrl.links.length).toBe(2);
    });

    it("should raise an alert message when the call to getProfile fails", function () {
        profileDefer.reject();

        scope.linkCtrl.init("false");
        scope.$apply();

        expect(scope.linkCtrl.links.length).toBe(0);
        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the links.");
    });

    it("should create a new empty link object at the start of the list when addLink is invoked", function () {
        scope.linkCtrl.links = [{"url": "blabla", "title": "linkTitle", "description": "desc"}];
        scope.linkCtrl.addLink();

        expect(scope.linkCtrl.links.length).toBe(2);
        expect(scope.linkCtrl.links[0].uuid).toBeNull();
        expect(scope.linkCtrl.links[0].title).toBe("");
        expect(scope.linkCtrl.links[0].url).toBe("http://");
        expect(scope.linkCtrl.links[0].description.length).toBe(0);
    });

    it("it should remove the specified link from the list when deleteLink is invoked", function () {
        scope.linkCtrl.links = [{"url": "url1", "title": "first", "description": "desc1"},
            {"url": "url2", "title": "second", "description": "desc2"},
            {"url": "url3", "title": "third", "description": "desc3"}];
        scope.linkCtrl.deleteLink(1);

        expect(scope.linkCtrl.links.length).toBe(2);
        expect(scope.linkCtrl.links[0].title).toBe("first");
        expect(scope.linkCtrl.links[1].title).toBe("third");
    });

    it("should invoke the updateLinks method of the profile service with the correct values when saveLinks is invoked", function () {
        scope.linkCtrl.opusId = "opusId1";
        scope.linkCtrl.profileId = "profileId1";
        var links = '[{"uuid":"uuid1","url":"url1","title":"first","description":"desc1"},{"uuid":"uuid1","url":"url2","title":"second","description":"desc2"}]';
        scope.linkCtrl.profile = {"uuid": "profileId1"};
        scope.linkCtrl.links = JSON.parse(links);

        saveLinksDefer.resolve("bla");
        scope.linkCtrl.saveLinks();
        scope.$apply();

        var data = '{"profileId":"profileId1","links":' + links + '}';

        expect(profileService.updateLinks).toHaveBeenCalledWith("opusId1", "profileId1", data);
        expect(messageService.success).toHaveBeenCalled();
    });

    it("should raise an alert message if the call to saveLinks fails", function () {
        var links = '[{"uuid":"uuid1","url":"url1","title":"first","description":"desc1"},{"uuid":"uuid1","url":"url2","title":"second","description":"desc2"}]';
        scope.linkCtrl.profile = {"uuid": "profileId1"};
        scope.linkCtrl.links = JSON.parse(links);

        saveLinksDefer.reject();
        scope.linkCtrl.saveLinks();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });
});
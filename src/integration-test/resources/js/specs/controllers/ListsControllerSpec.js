describe("ListsController tests", function () {
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
    var profileDefer, listsDefer, speciesProfileDefer, getFeatureDefer;

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName"}, "opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';
    var listsResponse = '[{},{}]';

    beforeAll(function () {
        console.log("****** Lists Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        profileDefer = $q.defer();
        listsDefer = $q.defer();
        speciesProfileDefer = $q.defer();
        getFeatureDefer = $q.defer();

        spyOn(profileService, "getProfile").and.returnValue(profileDefer.promise);
        spyOn(profileService, "retrieveLists").and.returnValue(listsDefer.promise);
        spyOn(profileService, "getSpeciesProfile").and.returnValue(speciesProfileDefer.promise);
        spyOn(profileService, "getFeatureLists").and.returnValue(getFeatureDefer.promise);

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("ListsEditor as listCtrl", {
            $scope: scope,
            profileService: profileService,
            util: mockUtil,
            messageService: messageService
        });
    }));

    it("should set the profile attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("false");
        scope.$apply();

        expect(scope.listCtrl.profile).toBeDefined();
    });

    it("should set the opus attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("false");
        scope.$apply();

        expect(scope.listCtrl.opus).toBeDefined();
    });

    it("should set the readonly flag to false when init is called with edit=false", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("false");
        scope.$apply();

        expect(scope.listCtrl.readonly).toBe(true);
    });

    it("should set the readonly flag to false when init is called with edit=true", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("true");
        scope.$apply();

        expect(scope.listCtrl.readonly).toBe(false);
    });

    it("should set the lists array on the scope with the results from the retrieveLists call", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("false");
        scope.$apply();

        expect(scope.listCtrl.lists.length).toBe(2);
    });

    it("should raise an alert message when the call to getProfile fails", function () {
        profileDefer.reject();
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("false");
        scope.$apply();

        expect(scope.listCtrl.profile).not.toBeDefined();
        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the profile.");
    });

    it("should raise an alert message when the call to retrieveLists fails", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.reject();

        scope.listCtrl.init("false");
        scope.$apply();

        expect(scope.listCtrl.lists.length).toBe(0);
        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the lists.");
    });

    it("should add a 'loading lists' info message when retrieving the lists, and remove it when done", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("false");
        scope.$apply();

        expect(messageService.info).toHaveBeenCalledWith("Loading lists...");
        expect(messageService.info.calls.count()).toBe(1);
    });

    it("should not attempt to load lists if the profile.guid attribute is not present", function () {
        var getProfileResponse = '{"profile": {"guid": "", "scientificName":"profileName"}, "opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';
        profileDefer.resolve(JSON.parse(getProfileResponse));
        listsDefer.resolve(JSON.parse(listsResponse));

        scope.listCtrl.init("false");
        scope.$apply();

        expect(profileService.retrieveLists).not.toHaveBeenCalled();
        expect(messageService.info).not.toHaveBeenCalled();
    });

    it("should return the expected colour code for all conservation statuses when getColourForStatus is called", function () {
        expect(scope.listCtrl.getColourForStatus("ENDAngered")).toBe("yellow");
        expect(scope.listCtrl.getColourForStatus("CriTICallY")).toBe("yellow");
        expect(scope.listCtrl.getColourForStatus("VulNERAble")).toBe("yellow");
        expect(scope.listCtrl.getColourForStatus("extINCT")).toBe("red");
        expect(scope.listCtrl.getColourForStatus("wiLD")).toBe("red");
        expect(scope.listCtrl.getColourForStatus("something ELSE")).toBe("green");
        expect(scope.listCtrl.getColourForStatus("")).toBe("green");
        expect(scope.listCtrl.getColourForStatus(null)).toBe("green");
        expect(scope.listCtrl.getColourForStatus(undefined)).toBe("green");
    });

    it("should retrieve the species profile and extract the conservation statuses when loadConservationStatus is invoked", function () {
        scope.listCtrl.opusId = "opusId";
        scope.listCtrl.profileId = "profileId";
        scope.listCtrl.profile = {guid: "guid"};

        speciesProfileDefer.resolve({conservationStatuses: [{region: "b"}, {region: "a"}, {region: "c"}]});
        scope.listCtrl.loadConservationStatus();
        scope.$apply();

        expect(profileService.getSpeciesProfile).toHaveBeenCalledWith("opusId", "profileId", "guid");
        expect(scope.listCtrl.conservationStatuses).toEqual([{region: "a"}, {region: "b"}, {region: "c"}])
    });

    it("should retrieve features when loadFeatureLists is invoked", function () {
        scope.listCtrl.opusId = "opusId";
        scope.listCtrl.opus = {};
        scope.listCtrl.profileId = "profileId";
        scope.listCtrl.profile = {guid: "guid"};

        getFeatureDefer.resolve([{metadata: {listName: "list1"}, items: [{key: "a", value: "b"}, {key: "c", value: "d"}]}]);
        scope.listCtrl.loadFeatureLists();
        scope.$apply();

        expect(profileService.getFeatureLists).toHaveBeenCalledWith("opusId", "profileId");
        expect(scope.listCtrl.featureLists).toEqual([{metadata: {listName: "list1"}, items: [{key: "a", value: "b"}, {key: "c", value: "d"}]}])
    });
});
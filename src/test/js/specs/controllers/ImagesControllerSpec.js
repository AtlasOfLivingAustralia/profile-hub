describe("ImagesController tests", function () {
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
    var form = {
        $setPristine: function () {},
        $setDirty: function () {}
    };
    var messageService;
    var profileService;
    var profileDefer, saveDefer, metadataDefer, imagesPagedDefer;

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "imageSettings": [{"imageId": "imageId2", "caption": "", "displayOption": "INCLUDE"}], "primaryImage": ""}, "opus": {"dataResourceConfig": {"imageSources": ["source1", "source2"]}}}';

    var retrieveImagesPagedResponse =     '{"images":[{"imageId": "imageId1", "largeImageUrl": "url1", "dataResourceName": "name1"}, {"imageId": "imageId2", "largeImageUrl": "url2", "dataResourceName": "name2"}],"count":5}';


    beforeAll(function () {
        console.log("****** Images Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        profileDefer = $q.defer();
        imagesPagedDefer = $q.defer();
        saveDefer = $q.defer();
        metadataDefer = $q.defer();

        spyOn(profileService, "getProfile").and.returnValue(profileDefer.promise);
        spyOn(profileService, "retrieveImagesPaged").and.returnValue(imagesPagedDefer.promise);
        spyOn(profileService, "updateProfile").and.returnValue(saveDefer.promise);
        spyOn(profileService, "getImageMetadata").and.returnValue(metadataDefer.promise);

        spyOn(form, "$setPristine");
        spyOn(form, "$setDirty");

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("ImagesController as imageCtrl", {
            $scope: scope,
            profileService: profileService,
            util: mockUtil,
            messageService: messageService
        });
    }));

    it("should set the profile attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.profile).toBeDefined();
    });

    it("should set the opus attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.opus).toBeDefined();
    });

    it("should set the readonly flag to false when init is called with edit=false", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));
        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.readonly).toBe(true);
    });

    it("should set the readonly flag to false when init is called with edit=true", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("true");
        scope.$apply();

        expect(scope.imageCtrl.readonly).toBe(false);
    });

    it("should set the images array on the scope with the results from the retrieveImages call", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));
        console.log(JSON.parse(retrieveImagesPagedResponse));
        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.images).toBeDefined();
        expect(scope.imageCtrl.images.length).toBe(2);
    });

    it("should default the primaryImage to the first item in the retrieveImages response", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.primaryImage).toBeDefined();
        expect(scope.imageCtrl.primaryImage.largeImageUrl).toBe("url1");
    });

    it("should set the primaryImage to the image identified by the primaryImage attribute of the profile if present", function () {
        var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "primaryImage": "imageId2"}, "opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';
        var retrieveImagesPagedResponse =  '{"images":[{"imageId": "imageId1", "largeImageUrl": "url1", "dataResourceName": "name1"}, {"imageId": "imageId2", "largeImageUrl": "url2", "dataResourceName": "name2"}], "primaryImage":{"imageId": "imageId2", "largeImageUrl": "url2", "dataResourceName": "name2"}, "count":5}';
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.primaryImage).toBeDefined();
        expect(scope.imageCtrl.primaryImage.largeImageUrl).toBe("url2");
    });

    it("should raise an alert message when the call to getProfile fails", function () {
        profileDefer.reject();
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.profile).not.toBeDefined();
        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the profile.");
    });

    it("should raise an alert message when the call to retrieveImages fails", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.reject();

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.images.length).toBe(0);
        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the images.");
    });

    it("should add a 'loading images' info message when retrieving the images, and remove it when done", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(messageService.info).toHaveBeenCalledWith("Loading images...");
        expect(messageService.info.calls.count()).toBe(1);
    });

    it("should not use the scientificName to retrieve images if the profile.guid attribute is not present", function () {
        scope.imageCtrl.opusId = "opusId1";
        scope.imageCtrl.profileId = "profileId1";
        var getProfileResponse = '{"profile": {"guid": "", "scientificName":"profileName"}, "opus": {"dataResourceUid": "drId", "dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';

        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(profileService.retrieveImagesPaged).toHaveBeenCalledWith("opusId1", "profileId1", "", true, 0, 20);
    });

    it("should use the profile.guid attribute prefixed with 'lsid:' to retrieve images if it is present", function () {
        scope.imageCtrl.opusId = "opusId1";
        scope.imageCtrl.profileId = "profileId1";
        var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName"}, "opus": {"dataResourceUid": "drId", "dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';

        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(profileService.retrieveImagesPaged).toHaveBeenCalledWith("opusId1", "profileId1", "lsid:guid1", true, 0, 20);
    });

    it("should ensure only 1 image is primary when changePrimaryImage is invoked", function() {
        scope.imageCtrl.images = [{imageId: "image1", primary: true}, {imageId: "image2", primary: false}, {imageId: "image3", primary: false}];

        scope.imageCtrl.changePrimaryImage("image2", form);

        expect(scope.imageCtrl.images[0].primary).toBeFalsy();
        expect(scope.imageCtrl.images[1].primary).toBeTruthy();
        expect(scope.imageCtrl.images[2].primary).toBeFalsy();
        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should add all image display options to the profile's imageDisplayOption list on save", function() {
        scope.imageCtrl.profile = {uuid: "profile1"};
        scope.imageCtrl.images = [{imageId: "image1", caption: '', displayOption: "INCLUDE"}, {imageId: "image2", caption: 'hello',displayOption: "EXCLUDE"}, {imageId: "image3", caption: 'world',displayOption: "INCLUDE"}];
        scope.imageCtrl.opusId = "opusId";
        scope.imageCtrl.profileId = "profileId";

        var expectedProfile = {uuid: "profile1", imageSettings: [{imageId: "image1", caption: '', displayOption: "INCLUDE"}, {imageId: "image2", caption: 'hello', displayOption: "EXCLUDE"}, {imageId: "image3", caption: 'world', displayOption: "INCLUDE"}], primaryImage: null};

        scope.imageCtrl.saveProfile(form);

        expect(profileService.updateProfile).toHaveBeenCalledWith("opusId", "profileId", expectedProfile);
    });

    it("should set the primary image attribute of the profile on save", function() {
        scope.imageCtrl.profile = {uuid: "profile1"};
        scope.imageCtrl.images = [{imageId: "image1", caption: '', displayOption: "INCLUDE"}, {imageId: "image2", caption: '', displayOption: "INCLUDE", primary: true}];
        scope.imageCtrl.opusId = "opusId";
        scope.imageCtrl.profileId = "profileId";

        var expectedProfile = {uuid: "profile1", primaryImage: "image2", imageSettings: [{imageId: "image1", caption: '', displayOption: "INCLUDE"}, {imageId: "image2", caption: '', displayOption: "INCLUDE"}]};

        scope.imageCtrl.saveProfile(form);

        expect(profileService.updateProfile).toHaveBeenCalledWith("opusId", "profileId", expectedProfile);
    });

    it("should show the caption when the caption is set", function() {
        scope.imageCtrl.profile = {uuid: 'profile1'};
        var image = {imageId: 'image1', caption: 'test', displayOption: "INCLUDE", metadata: {title: 'wrong'}};
        scope.imageCtrl.images = [image];
        scope.imageCtrl.opusId = "opusId";
        scope.imageCtrl.profileId = "profileId";
        scope.imageCtrl.readOnly = true;

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.imageCaption(image)).toBe('test');
    });

    it("should show the original title when the caption is not set", function() {
        scope.imageCtrl.profile = {uuid: 'profile1'};
        var image = {imageId: 'image1', caption: '', displayOption: "INCLUDE", metadata: {title: 'right'}};
        scope.imageCtrl.images = [image];
        scope.imageCtrl.opusId = "opusId";
        scope.imageCtrl.profileId = "profileId";
        scope.imageCtrl.readOnly = true;

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(scope.imageCtrl.imageCaption(image)).toBe('right');
    });

    it("should detect changes to the primary image and respond by reloading the images", function() {
        var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "primaryImage": "imageId2"}, "opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';
        profileDefer.resolve(JSON.parse(getProfileResponse));
        imagesPagedDefer.resolve(JSON.parse(retrieveImagesPagedResponse));

        scope.imageCtrl.init("false");
        scope.$apply();

        expect(profileService.retrieveImagesPaged).toHaveBeenCalledWith('opusId1', 'profileId1', "lsid:guid1", true, 0, 20);
        expect(scope.imageCtrl.profile.primaryImage).toBe("imageId2");

        scope.imageCtrl.profile.primaryImage = "imageId1";

        scope.$apply();
        expect(profileService.retrieveImagesPaged).toHaveBeenCalledWith('opusId1', 'profileId1', "lsid:guid1", true, 0, 20);

    });
});
describe("CreateProfileController tests", function () {
    var controller;
    var scope;
    var profileService;

    var createDefer;

    var modalInstance = {
        dismiss: function(d) {},
        close: function(d) {}
    };


    beforeAll(function () {
        console.log("****** Create Profile Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        createDefer = $q.defer();

        spyOn(profileService, "createProfile").and.returnValue(createDefer.promise);
        spyOn(profileService, "duplicateProfile").and.returnValue(createDefer.promise);

        spyOn(modalInstance, "close");
        spyOn(modalInstance, "dismiss");

        controller = $controller("CreateProfileController as profileCtrl", {
            $scope: scope,
            profileService: profileService,
            $modalInstance: modalInstance,
            opusId: "opus1234",
            duplicateExisting: false
        });

    }));

    it("should dismiss the modal when cancel is invoked", function() {
        scope.profileCtrl.cancel();

        expect(modalInstance.dismiss).toHaveBeenCalled();
    });

    it("should set the error attribute if the call to createProfile fails", function() {
        createDefer.reject();

        scope.profileCtrl.ok();
        scope.$apply();

        expect(scope.profileCtrl.error).toBe("An error occurred while creating the profile.");
        expect(modalInstance.close).not.toHaveBeenCalled();
    });

    it("should set the error attribute if the call to createProfile returns a null", function() {
        createDefer.resolve(null);

        scope.profileCtrl.ok();
        scope.$apply();

        expect(scope.profileCtrl.error).toBe("An error occurred while creating the profile.");
        expect(modalInstance.close).not.toHaveBeenCalled();
    });

    it("should close the modal instance, passing in the new profile, when createProfile succeeds", function() {
        var profile = {uuid: "newuuid"};

        createDefer.resolve(profile);

        scope.profileCtrl.ok();
        scope.$apply();

        expect(modalInstance.close).toHaveBeenCalledWith(profile);
    });

    it("should invoke ProfileService.createProfile when OK is clicked if duplicateExisting = false", function() {
        scope.profileCtrl.duplicateExisting = false;
        scope.profileCtrl.opusId = "1234";
        scope.profileCtrl.scientificName = "new profile";
        scope.profileCtrl.manuallyMatchedGuid = "9876";

        scope.profileCtrl.ok();

        expect(profileService.createProfile).toHaveBeenCalledWith("1234", "new profile", "9876", []);
        expect(profileService.duplicateProfile).not.toHaveBeenCalled();
    });

    it("should invoke ProfileService.duplicateProfile when OK is clicked if duplicateExisting = true, and the existing profile is valid", function() {
        scope.profileCtrl.duplicateExisting = true;
        scope.profileCtrl.opusId = "1234";
        scope.profileCtrl.scientificName = "copy profile";
        scope.profileCtrl.manuallyMatchedGuid = "9876";
        scope.profileCtrl.profileToCopy = {profileId: "existing1", scientificName: "existing profile"};

        scope.profileCtrl.ok();

        expect(profileService.createProfile).not.toHaveBeenCalled();
        expect(profileService.duplicateProfile).toHaveBeenCalledWith("1234", "existing1", "copy profile", "9876", []);
    });

    it("should pass the manually constructed hierarchy to ProfileService.duplicateProfile if present", function() {
        scope.profileCtrl.duplicateExisting = true;
        scope.profileCtrl.opusId = "1234";
        scope.profileCtrl.scientificName = "copy profile";
        scope.profileCtrl.manuallyMatchedGuid = "9876";
        scope.profileCtrl.profileToCopy = {profileId: "existing1", scientificName: "existing profile"};

        var hierarchy = [
            {name: "name1", guid: "g1", rank: "r1"},
            {name: "name3", guid: "g3", rank: "r3"}
        ];
        scope.profileCtrl.manualHierarchy = hierarchy;

        scope.profileCtrl.ok();

        expect(profileService.duplicateProfile).toHaveBeenCalledWith("1234", "existing1", "copy profile", "9876", hierarchy);
    });

    it("should pass the manually constructed hierarchy to ProfileService.createProfile if present", function() {
        scope.profileCtrl.duplicateExisting = false;
        scope.profileCtrl.opusId = "1234";
        scope.profileCtrl.scientificName = "profile";
        scope.profileCtrl.manuallyMatchedGuid = "9876";

        var hierarchy = [
            {name: "name1", guid: "g1", rank: "r1"},
            {name: "name3", guid: "g3", rank: "r3"}
        ];
        scope.profileCtrl.manualHierarchy = hierarchy;

        scope.profileCtrl.ok();

        expect(profileService.createProfile).toHaveBeenCalledWith("1234", "profile", "9876", hierarchy);
    });

    it("should do nothing if OK is clicked when duplicateExisting = true, but the existing profile is invalid", function() {
        scope.profileCtrl.duplicateExisting = true;
        scope.profileCtrl.opusId = "1234";
        scope.profileCtrl.scientificName = "copy profile";
        scope.profileCtrl.manuallyMatchedGuid = "9876";
        scope.profileCtrl.profileToCopy = {profileId: null, scientificName: "existing profile"};

        scope.profileCtrl.ok();

        expect(profileService.createProfile).not.toHaveBeenCalled();
        expect(profileService.duplicateProfile).not.toHaveBeenCalled();
    });

    it("should return false when validExistingProfileSelection() is invoked and the profile to copy is undefined", function() {
        scope.profileCtrl.profileToCopy = undefined;

        var valid = scope.profileCtrl.validExistingProfileSelection();

        expect(valid).toBeFalsy();
    });

    it("should return false when validExistingProfileSelection() is invoked and the profile to copy is null", function() {
        scope.profileCtrl.profileToCopy = null;

        var valid = scope.profileCtrl.validExistingProfileSelection();

        expect(valid).toBeFalsy();
    });

    it("should return false when validExistingProfileSelection() is invoked and the profile to copy has no ID", function() {
        scope.profileCtrl.profileToCopy = {profileId: undefined};

        var valid = scope.profileCtrl.validExistingProfileSelection();

        expect(valid).toBeFalsy();
    });

    it("should return false when validExistingProfileSelection() is invoked and the profile to copy has a valid id", function() {
        scope.profileCtrl.profileToCopy = {profileId: "1234"};

        var valid = scope.profileCtrl.validExistingProfileSelection();

        expect(valid).toBeTruthy();
    });
});


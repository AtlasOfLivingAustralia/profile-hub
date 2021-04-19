describe("ProfileController tests", function () {
    var PROFILE_ID = "281ff2a5-e8d9-43ff-aff9-e20144b6a94c";
    var controller;
    var scope;
    var form;
    var messageService;
    var profileService;
    var util;
    var window;
    var profileDefer, deleteDefer, confirmDefer, modalDefer, updateDefer, authorDefer, archiveDefer, restoreDefer, searchDefer;

    var mockConfig = {
        readonly: true
    };

    var modal = {
        open: function() {}
    };

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "attributes":[{"title": "attr1"}, {"title": "attr2"}]}, "opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';

    beforeAll(function () {
        console.log("****** Profile Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_, _util_, _$window_) {
        scope = $rootScope.$new();
        profileService = _profileService_;
        util = _util_;
        window = _$window_;

        profileDefer = $q.defer();
        deleteDefer = $q.defer();
        confirmDefer = $q.defer();
        modalDefer = $q.defer();
        updateDefer = $q.defer();
        authorDefer = $q.defer();
        archiveDefer = $q.defer();
        restoreDefer = $q.defer();
        searchDefer = $q.defer();

        var popup = {
            result: modalDefer.promise
        };

        spyOn(profileService, "getProfile").and.returnValue(profileDefer.promise);
        spyOn(profileService, "deleteProfile").and.returnValue(deleteDefer.promise);
        spyOn(profileService, "updateProfile").and.returnValue(updateDefer.promise);
        spyOn(profileService, "saveAuthorship").and.returnValue(authorDefer.promise);
        spyOn(profileService, "archiveProfile").and.returnValue(archiveDefer.promise);
        spyOn(profileService, "restoreArchivedProfile").and.returnValue(restoreDefer.promise);
        spyOn(profileService, "profileSearch").and.returnValue(searchDefer.promise);

        spyOn(modal, "open").and.returnValue(popup);

        spyOn(util, "getPathItem").and.returnValue(PROFILE_ID);
        spyOn(util, "confirm").and.returnValue(confirmDefer.promise);
        spyOn(util, "contextRoot").and.returnValue("/context");
        spyOn(util, "redirect");
        spyOn(util, "getEntityId").and.returnValue("profileId");

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("ProfileController as profileCtrl", {
            $scope: scope,
            profileService: profileService,
            util: util,
            messageService: messageService,
            $modal: modal,
            config: mockConfig
        });

        form = {
            dirty: false,
            $setPristine: function () {
                this.dirty = false;
            },
            $setDirty: function () {
                this.dirty = true;
            }
        };
        spyOn(form, "$setPristine");
        spyOn(form, "$setDirty");
    }));

    it("should set the profile attribute of the current scope when the controller is loaded", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        scope.profileCtrl.loadProfile();
        scope.$apply();

        expect(profileService.getProfile).toHaveBeenCalled();
        expect(scope.profileCtrl.profile).toBeDefined();
    });

    it("should raise an alert message when getProfile fails", function () {
        profileDefer.reject();

        scope.profileCtrl.loadProfile();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while loading the profile.");
    });

    it("should display the confirmation popup when deleteProfile is invoked", function() {
        scope.profileCtrl.deleteProfile();

        expect(util.confirm).toHaveBeenCalled();
    });

    it("should do nothing if the confirmation popup is cancelled when deleteProfile is invoked", function() {
        confirmDefer.reject();
        scope.$apply();

        scope.profileCtrl.deleteProfile();

        expect(profileService.deleteProfile).not.toHaveBeenCalled();
    });

    it("should invoke profileService.deleteProfile when deleteProfile is confirmed", function() {
        scope.profileCtrl.profile = {profileId: PROFILE_ID};
        scope.profileCtrl.profileId = PROFILE_ID;
        scope.profileCtrl.opus = {uuid: "opusId"};
        confirmDefer.resolve();

        scope.profileCtrl.deleteProfile();
        scope.$apply();

        expect(profileService.deleteProfile).toHaveBeenCalledWith("opusId", PROFILE_ID);
    });

    it("should redirect to the opus main page when deleteProfile succeeds", function() {
        scope.profileCtrl.profile = {profileId: PROFILE_ID};
        scope.profileCtrl.opus = {uuid: "opusId"};
        confirmDefer.resolve();
        deleteDefer.resolve({});

        scope.profileCtrl.deleteProfile();
        scope.$apply();

        expect(util.redirect).toHaveBeenCalledWith("/context/opus/opusId");
        expect(messageService.alert).not.toHaveBeenCalled();
    });

    it("should raise an alert message when deleteProfile fails", function() {
        scope.profileCtrl.profile = {profileId: PROFILE_ID};
        scope.profileCtrl.opus = {uuid: "opusId"};
        confirmDefer.resolve();
        deleteDefer.reject();

        scope.profileCtrl.deleteProfile();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while deleting the profile.");
    });

    it("should open the modal dialog, and redirect to the edit profile page when it is closed, when createProfile is invoked", function() {
        scope.profileCtrl.createProfile("opusId");

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/createProfile.htm"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({ controller: "CreateProfileController"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controllerAs: "createProfileCtrl"}));
    });

    it("should open the modal dialog, and redirect to the edit profile page when it is closed, when createProfile is invoked", function() {
        modalDefer.resolve({uuid: "newProfileId", scientificName: "sciName"});
        scope.profileCtrl.opusId = "opusId1";

        scope.profileCtrl.createProfile("opusId");
        scope.$apply();

        expect(util.redirect).toHaveBeenCalledWith("/context/opus/opusId1/profile/sciName/update");
    });

    it("should create a new list when addBibliography is invoked if one doesn't exist", function() {
        scope.profileCtrl.profile = {};
        scope.profileCtrl.addBibliography(form);

        expect(scope.profileCtrl.profile.bibliography.length).toBe(1);
        expect(scope.profileCtrl.profile.bibliography[0].order).toBe(0);
    });

    it("should add new bibliography to the profile's list, with the correct order, when addBibliography is invoked", function() {
        scope.profileCtrl.profile = {bibliography: [{uuid:"id1", order: 0}, {uuid:"id2", order: 1}]};
        scope.profileCtrl.addBibliography(form);

        expect(scope.profileCtrl.profile.bibliography.length).toBe(3);
        expect(scope.profileCtrl.profile.bibliography[2].order).toBe(2);
    });

    it("should remove the specified bibliography item from the profile's list when deleteBibliography is invoked", function() {
        scope.profileCtrl.profile = {bibliography: [{uuid:"id1", order: 0}, {uuid:"id2", order: 1}]};
        scope.profileCtrl.deleteBibliography(1, form);

        expect(scope.profileCtrl.profile.bibliography.length).toBe(1);
        expect(scope.profileCtrl.profile.bibliography[0].order).toBe(0);
    });

    it("should remove the re-order all subsequent bibliography items when deleteBibliography is invoked", function() {
        scope.profileCtrl.profile = {bibliography: [{uuid:"id1", order: 0},
                                                    {uuid:"id2", order: 1},
                                                    {uuid:"id3", order: 2},
                                                    {uuid:"id4", order: 3}]};
        scope.profileCtrl.deleteBibliography(1, form);

        expect(scope.profileCtrl.profile.bibliography.length).toBe(3);
        expect(scope.profileCtrl.profile.bibliography[0].order).toBe(0);
        expect(scope.profileCtrl.profile.bibliography[1].order).toBe(1);
        expect(scope.profileCtrl.profile.bibliography[2].order).toBe(2);
    });

    it("should swap the positions of two items when moveBibliographyUp is invoked", function() {
        scope.profileCtrl.profile = {bibliography: [{uuid:"id1", order: 0},
            {uuid:"id2", order: 1},
            {uuid:"id3", order: 2},
            {uuid:"id4", order: 3}]};
        scope.profileCtrl.moveBibliographyUp(2, form);

        expect(scope.profileCtrl.profile.bibliography[0].uuid).toBe("id1");
        expect(scope.profileCtrl.profile.bibliography[1].uuid).toBe("id3");
        expect(scope.profileCtrl.profile.bibliography[2].uuid).toBe("id2");
        expect(scope.profileCtrl.profile.bibliography[3].uuid).toBe("id4");
    });

    it("should swap the positions of two items when moveBibliographyDown is invoked", function() {
        scope.profileCtrl.profile = {bibliography: [{uuid:"id1", order: 0},
            {uuid:"id2", order: 1},
            {uuid:"id3", order: 2},
            {uuid:"id4", order: 3}]};
        scope.profileCtrl.moveBibliographyDown(2, form);

        expect(scope.profileCtrl.profile.bibliography[0].uuid).toBe("id1");
        expect(scope.profileCtrl.profile.bibliography[1].uuid).toBe("id2");
        expect(scope.profileCtrl.profile.bibliography[2].uuid).toBe("id4");
        expect(scope.profileCtrl.profile.bibliography[3].uuid).toBe("id3");
    });

    it("should invoke the updateProfile operation of the profile service when saveProfile is invoked", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId"};

        scope.profileCtrl.saveProfile(form);

        expect(profileService.updateProfile).toHaveBeenCalledWith("opusId", "profileId", scope.profileCtrl.profile);
    });

    it("should replace the current profile and raise a success message when the updateProfile succeeds", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId", scientificName: "sciName"};

        updateDefer.resolve({uuid: "profileId", scientificName: "new name"});
        scope.profileCtrl.saveProfile(form);
        scope.$apply();

        expect(messageService.success).toHaveBeenCalled();
        expect(scope.profileCtrl.profile.scientificName).toBe("new name");
        expect(form.$setPristine).toHaveBeenCalled();
    });

    it("should raise an alert message when the updateProfile fails", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId", scientificName: "sciName"};

        updateDefer.reject();
        scope.profileCtrl.saveProfile(form);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should call the saveAuthorship service operation with a MAP of authorships when saveAuthorship is invoked", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId", scientificName: "sciName", authorship: [{category: "Author", text: "Fred"}]};

        scope.profileCtrl.saveAuthorship(form);

        expect(profileService.saveAuthorship).toHaveBeenCalledWith("opusId", "profileId", {authorship: [{category: "Author", text: "Fred"}]});
    });

    it("should raise a success message when the saveAuthorship succeeds", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId", scientificName: "sciName", authorship: [{category: "Author", text: "Fred"}]};

        authorDefer.resolve([{category: "Author", text: "Fred, Bob"}]);
        scope.profileCtrl.saveAuthorship(form);
        scope.$apply();

        expect(messageService.success).toHaveBeenCalled();
        expect(form.$setPristine).toHaveBeenCalled();
    });

    it("should raise an alert message when the saveAuthorship fails", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId", scientificName: "sciName", authorship: [{category: "Author", text: "Fred, Bob"}]};

        authorDefer.reject();
        scope.profileCtrl.saveAuthorship(form);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should create a new authorship list prepopulated with an 'Author' entry if the profile has no authorship when addAuthorship is invoked", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId", scientificName: "sciName"};

        scope.profileCtrl.addAuthorship(form);

        expect(scope.profileCtrl.profile.authorship).toBeDefined();
        expect(scope.profileCtrl.profile.authorship).toEqual([{category: "Author", text: ""}]);
    });

    it("should add a new, empty authorship entry if the profile has authorships when addAuthorship is invoked", function() {
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.profileId = "profileId";
        scope.profileCtrl.profile = {uuid: "profileId", scientificName: "sciName", authorship: [{category: "Author", text: "Fred"}]};

        scope.profileCtrl.addAuthorship(form);

        expect(scope.profileCtrl.profile.authorship.length).toBe(2);
        expect(scope.profileCtrl.profile.authorship[0]).toEqual({category: "Author", text: "Fred"});
        expect(scope.profileCtrl.profile.authorship[1]).toEqual({category: "", text: ""});
    });

    it("should correctly format scientific names and authors when format name is called", function() {
        // binomial name with single word author
        scope.profileCtrl.profile = {scientificName: "Acacia dealbata", nameAuthor: "Link", fullName: "Acacia dealbata Link"};
        expect(scope.profileCtrl.formatName()).toBe("<span class='scientific-name'>Acacia dealbata <span class='normal-text'>Link</span></span>");

        // binomial name with multiple authors
        scope.profileCtrl.profile = {scientificName: "Acacia abrupta", nameAuthor: "Maiden & Blakely", fullName: "Acacia abrupta Maiden & Blakely"};
        expect(scope.profileCtrl.formatName()).toBe("<span class='scientific-name'>Acacia abrupta <span class='normal-text'>Maiden & Blakely</span></span>");

        // autonym
        scope.profileCtrl.profile = {scientificName: "Acacia dealbata Link subsp. dealbata", nameAuthor: "Link", fullName: "Acacia dealbata Link subsp. dealbata", matchedName: {scientificName: "Acacia dealbata Link subsp. dealbata"}};
        expect(scope.profileCtrl.formatName()).toBe("<span class='scientific-name'>Acacia dealbata <span class='normal-text'>Link</span> <span class='normal-text'>subsp.</span> dealbata</span>");

        // subspecies
        scope.profileCtrl.profile = {scientificName: "Acacia dealbata subsp. subalpina", nameAuthor: "Tindale & Kodela", fullName: "Acacia dealbata subsp. subalpina Tindale & Kodela"};
        expect(scope.profileCtrl.formatName()).toBe("<span class='scientific-name'>Acacia dealbata <span class='normal-text'>subsp.</span> subalpina <span class='normal-text'>Tindale & Kodela</span></span>");

        // variant
        scope.profileCtrl.profile = {scientificName: "Acacia dealbata var. mackayana", nameAuthor: "Seem.", fullName: "Acacia dealbata var. mackayana Seem."};
        expect(scope.profileCtrl.formatName()).toBe("<span class='scientific-name'>Acacia dealbata <span class='normal-text'>var.</span> mackayana <span class='normal-text'>Seem.</span></span>");


        // if the full name is not set, use the scientific name and name author
        scope.profileCtrl.profile = {nameAuthor: "Tindale & Kodela", scientificName: "Acacia dealbata subsp. subalpina"};
        expect(scope.profileCtrl.formatName()).toBe("<span class='scientific-name'>Acacia dealbata <span class='normal-text'>subsp.</span> subalpina <span class='normal-text'>Tindale & Kodela</span></span>");
    });

    it("should return true when isArchived is called and the profile has an archivedDate, false otherwise", function() {
        scope.profileCtrl.profile = {archivedDate: new Date()};
        expect(scope.profileCtrl.isArchived()).toBeTruthy();

        scope.profileCtrl.profile = {archivedDate: null};
        expect(scope.profileCtrl.isArchived()).toBeFalsy();

        scope.profileCtrl.profile = {};
        expect(scope.profileCtrl.isArchived()).toBeFalsy();

        scope.profileCtrl.profile = null;
        expect(scope.profileCtrl.isArchived()).toBeFalsy();
    });

    it("should show the modal archive profile popup when archiveProfile is invoked", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID};
        scope.profileCtrl.opus = {uuid: "opusId"};

        scope.profileCtrl.archiveProfile();
        scope.$apply();

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/archiveProfilePopup.htm"}));
    });

    it("should redirect to the profile view page when archiveProfile succeeds", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID};
        scope.profileCtrl.opus = {uuid: "opusId"};
        archiveDefer.resolve({});
        modalDefer.resolve({archiveComment: "archive comment"});

        scope.profileCtrl.archiveProfile();
        scope.$apply();

        expect(util.redirect).toHaveBeenCalledWith("/context/opus/opusId/profile/" + PROFILE_ID);
        expect(messageService.alert).not.toHaveBeenCalled();
    });

    it("should raise an alert message when archiveProfile fails", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID};
        scope.profileCtrl.opus = {uuid: "opusId"};
        archiveDefer.reject();
        modalDefer.resolve({archiveComment: "archive comment"});

        scope.profileCtrl.archiveProfile();
        scope.$apply();

        expect(util.redirect).not.toHaveBeenCalled();
        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should invoke the profile search service when restoreProfile is invoked to check for new profiles with the same name as the profile being restored", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID, scientificName: "archived name", archivedWithName: "original name"};
        scope.profileCtrl.opusId = "opusId";
        restoreDefer.resolve({});

        scope.profileCtrl.restoreProfile();
        scope.$apply();

        expect(profileService.profileSearch).toHaveBeenCalledWith("opusId", "original name", false);
    });

    it("should show a confirmation dialog when restoreProfile is invoked and there are no duplicate names", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID};
        scope.profileCtrl.opus = {uuid: "opusId"};
        searchDefer.resolve([]);
        confirmDefer.resolve();

        scope.profileCtrl.restoreProfile();
        scope.$apply();

        expect(util.confirm).toHaveBeenCalled();
        expect(modal.open).not.toHaveBeenCalled();
    });

    it("should redirect to the profile view page when restoreProfile succeeds and there are no duplicate profile names and the confirmation was accepted", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID};
        scope.profileCtrl.opusId = "opusId";
        scope.profileCtrl.opus = {shortName: "sname"};
        searchDefer.resolve([]);
        confirmDefer.resolve();
        restoreDefer.resolve({scientificName: "updated profile"});

        scope.profileCtrl.restoreProfile();
        scope.$apply();

        expect(modal.open).not.toHaveBeenCalled();
        expect(profileService.restoreArchivedProfile).toHaveBeenCalledWith("opusId", PROFILE_ID, null);
        expect(util.redirect).toHaveBeenCalledWith("/context/opus/sname/profile/updated profile");
        expect(messageService.alert).not.toHaveBeenCalled();
    });

    it("should display the restore profile popup when restoreProfile is invoked and there are duplicate profile names", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID};
        scope.profileCtrl.opus = {shortName: "sname"};
        scope.profileCtrl.opusId = "opusId";
        searchDefer.resolve([{uuid: "newProfile1"}]);
        confirmDefer.resolve();

        scope.profileCtrl.restoreProfile();
        scope.$apply();

        expect(util.confirm).not.toHaveBeenCalled();
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/restoreProfilePopup.htm"}));
    });

    it("should redirect to the profile view page when restoreProfile succeeds and there are duplicate profile names", function() {
        scope.profileCtrl.profile = {uuid: PROFILE_ID};
        scope.profileCtrl.opus = {shortName: "sname"};
        scope.profileCtrl.opusId = "opusId";
        searchDefer.resolve([{uuid: "newProfile1"}]);
        modalDefer.resolve("new profile name");
        restoreDefer.resolve({scientificName: "new profile name"});

        scope.profileCtrl.restoreProfile();
        scope.$apply();

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/restoreProfilePopup.htm"}));
        expect(profileService.restoreArchivedProfile).toHaveBeenCalledWith("opusId", PROFILE_ID, "new profile name");
        expect(util.redirect).toHaveBeenCalledWith("/context/opus/sname/profile/new profile name");
        expect(messageService.alert).not.toHaveBeenCalled();
    });

    it("should leave manualHierarchy undefined when constructManualHierarchyForNameDirective is invoked when readonly = true", function() {
        scope.profileCtrl.profile = {
            classification: [{name: "one", guid: "123", rank: "r1"}],
            manualClassification: true
        };
        mockConfig.readonly = true;

        scope.profileCtrl.constructManualHierarchyForNameDirective();

        expect(scope.profileCtrl.manualHierarchy.length).toBe(0);
    });

    it("should leave manualHierarchy undefined when constructManualHierarchyForNameDirective is invoked when profile.manualClassification = false", function() {
        scope.profileCtrl.manualHierarchy = []; // any existing value will be discarded, leaving it undefined
        scope.profileCtrl.profile = {
            classification: [{name: "one", guid: "123", rank: "r1"}],
            manualClassification: false
        };
        mockConfig.readonly = false;

        scope.profileCtrl.constructManualHierarchyForNameDirective();

        expect(scope.profileCtrl.manualHierarchy.length).toBe(0);
    });

    it("should set the manualHierarchy when constructManualHierarchyForNameDirective is invoked when readonly = false and profile.manualClassification = true", function() {
        scope.profileCtrl.profile = {
            classification: [{name: "profile", guid: "123", rank: "r1"}],
            manualClassification: true
        };
        mockConfig.readonly = false;

        scope.profileCtrl.constructManualHierarchyForNameDirective();

        expect(scope.profileCtrl.manualHierarchy.length).toBe(1);
    });

    it("should always include the profile as the first item in the manualHierarchy, with guid = null", function() {
        scope.profileCtrl.profile = {
            scientificName: "profileName",
            rank: "r1",
            profileId: "p1",
            classification: [ // classification is always ordered top-down
                {name: "parent", guid: "123", rank: "r2"},
                {name: "profileName", profileId: "p1", rank: "r1"}
            ],
            manualClassification: true
        };
        mockConfig.readonly = false;

        scope.profileCtrl.constructManualHierarchyForNameDirective();

        // manual hierarchy is always constructed bottom-up
        expect(scope.profileCtrl.manualHierarchy.length).toBe(2);
        expect(scope.profileCtrl.manualHierarchy[0].name).toBe("profileName");
        expect(scope.profileCtrl.manualHierarchy[0].guid).toBeNull(); // the guid for the first item must be null
        expect(scope.profileCtrl.manualHierarchy[0].rank).toBe("r1");
        expect(scope.profileCtrl.manualHierarchy[0].checked).toBeTruthy();
    });

    it("should always include items up to and including the first one with a profileId", function() {
        scope.profileCtrl.profile = {
            scientificName: "profileName",
            rank: "r1",
            profileId: "p1",
            classification: [ // classification is always ordered top-down
                {name: "tooFar2", rank: "r5"},
                {name: "tooFar1", profileId: "123", rank: "r4"},
                {name: "greatGrandparent", profileId: "123", rank: "r4"},
                {name: "grandparent", rank: "r3"},
                {name: "parent", rank: "r2"},
                {name: "profileName", profileId: "p1", rank: "r1"}
            ],
            manualClassification: true
        };
        mockConfig.readonly = false;

        scope.profileCtrl.constructManualHierarchyForNameDirective();

        // manual hierarchy is always constructed bottom-up
        expect(scope.profileCtrl.manualHierarchy.length).toBe(4);
        expect(scope.profileCtrl.manualHierarchy[0].name).toBe("profileName");
        expect(scope.profileCtrl.manualHierarchy[0].guid).toBeFalsy();
        expect(scope.profileCtrl.manualHierarchy[1].name).toBe("parent");
        expect(scope.profileCtrl.manualHierarchy[1].guid).toBeFalsy();
        expect(scope.profileCtrl.manualHierarchy[2].name).toBe("grandparent");
        expect(scope.profileCtrl.manualHierarchy[2].guid).toBeFalsy();
        expect(scope.profileCtrl.manualHierarchy[3].name).toBe("greatGrandparent");
        expect(scope.profileCtrl.manualHierarchy[3].guid).toBe("123");
    });

    it("should always include items up to and including the first one with a guid", function() {
        scope.profileCtrl.profile = {
            scientificName: "profileName",
            rank: "r1",
            profileId: "p1",
            classification: [ // classification is always ordered top-down
                {name: "tooFar2", rank: "r5"},
                {name: "tooFar1", profileId: "123", rank: "r4"},
                {name: "greatGrandparent", guid: "123", rank: "r4"},
                {name: "grandparent", rank: "r3"},
                {name: "parent", rank: "r2"},
                {name: "profileName", profileId: "p1", rank: "r1"}
            ],
            manualClassification: true
        };
        mockConfig.readonly = false;

        scope.profileCtrl.constructManualHierarchyForNameDirective();

        // manual hierarchy is always constructed bottom-up
        expect(scope.profileCtrl.manualHierarchy.length).toBe(4);
        expect(scope.profileCtrl.manualHierarchy[0].name).toBe("profileName");
        expect(scope.profileCtrl.manualHierarchy[0].guid).toBeFalsy();
        expect(scope.profileCtrl.manualHierarchy[1].name).toBe("parent");
        expect(scope.profileCtrl.manualHierarchy[1].guid).toBeFalsy();
        expect(scope.profileCtrl.manualHierarchy[2].name).toBe("grandparent");
        expect(scope.profileCtrl.manualHierarchy[2].guid).toBeFalsy();
        expect(scope.profileCtrl.manualHierarchy[3].name).toBe("greatGrandparent");
        expect(scope.profileCtrl.manualHierarchy[3].guid).toBe("123");
    });
});


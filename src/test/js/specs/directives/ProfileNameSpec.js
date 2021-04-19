describe('Directive: ProfileName', function () {
    var scope, compile;

    var util, profileService;
    var checkNameDefer, autocompleteNameDefer, profileSearchDefer;

    var nameTemplate = '<profile-name name="profileCtrl.newName" valid="profileCtrl.nameIsValid" current-profile-id="profileCtrl.profile.uuid" manual-hierarchy="profileCtrl.manualHierarchy" edit-mode="true" manually-matched-guid="profileCtrl.manuallyMatchedGuid"></profile-name>';

    beforeAll(function () {
        console.log("****** Profile Name Directive Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        module('profileEditor');

        inject(function ($compile, $rootScope, $q, _util_, _profileService_) {
            var testScope = $rootScope.$new();
            compile = $compile;
            util = _util_;
            profileService = _profileService_;

            checkNameDefer = $q.defer();
            autocompleteNameDefer = $q.defer();
            profileSearchDefer = $q.defer();

            spyOn(profileService, "profileSearch").and.returnValue(profileSearchDefer.promise);
            spyOn(profileService, "autocompleteName").and.returnValue(autocompleteNameDefer.promise);
            spyOn(profileService, "checkName").and.returnValue(checkNameDefer.promise);

            var element = angular.element(nameTemplate);
            $compile(element)(testScope);
            testScope.$digest();
            scope = element.isolateScope();
        });

        scope.$digest();
    });

    it("should reset all values when resetNameCheck is invoked", function () {
        scope.nameCheck = {};
        scope.errors = ["err1"];
        scope.warnings = ["warn1"];
        scope.valid = true;
        scope.manuallyMatchedGuid = "1234";
        scope.manuallyMatchedName = "name1";
        scope.showManualMatch = true;
        scope.showManualHierarchy = true;
        scope.manualHierarchy = [{name: "1"}, {name: "2"}];

        scope.resetNameCheck();

        expect(scope.nameCheck).toBeNull();
        expect(scope.errors.length).toBe(0);
        expect(scope.warnings.length).toBe(0);
        expect(scope.valid).toBeFalsy();
        expect(scope.manuallyMatchedGuid).toBeNull();
        expect(scope.manuallyMatchedName).toBeNull();
        expect(scope.showManualMatch).toBeFalsy();
        expect(scope.showManualHierarchy).toBeFalsy();
        expect(scope.manualHierarchy.length).toBe(0);
    });

    it("should invoke the checkName service with the opusId and provided name when checkName() is called", function () {
        scope.name = "test";
        scope.opusId = "1234";

        scope.checkName();

        expect(profileService.checkName).toHaveBeenCalledWith("1234", "test");
    });

    it("should set the nameCheck.matchedName property  when checkName() is called if there is a matched name", function () {
        checkNameDefer.resolve({
            matchedName: {
                fullName: "Acacia dealbata Link",
                guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            },
            matchedNameDuplicates: [],
            providedName: "Acacia dealbata",
            providedNameDuplicates: []
        });
        scope.name = "acacia dealbata";
        scope.opusId = "1234";

        scope.checkName();
        scope.$apply();

        expect(scope.nameCheck.noMatch).toBeFalsy();
        expect(scope.nameCheck.mismatch).toBeFalsy();
        expect(scope.nameCheck.matchedName.formattedName).toBe("<span class='scientific-name'>Acacia dealbata Link</span>");
    });

    it("should set the nameCheck.providedNameDuplicate flag if the provided name matches an existing profile", function () {
        checkNameDefer.resolve({
            matchedName: {
                fullName: "Acacia dealbata Link",
                guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            },
            matchedNameDuplicates: [],
            providedName: "Acacia dealbata",
            providedNameDuplicates: [{
                fullName: "Acacia dealbata Link",
                nameAuthor: "Link",
                profileId: "b484380d-4d04-4fcc-bb71-c38f33829ead",
                rank: "species",
                scientificName: "Acacia dealbata"
            }]
        });
        scope.name = "acacia dealbata";
        scope.opusId = "1234";

        scope.checkName();
        scope.$apply();

        expect(scope.nameCheck.providedNameDuplicate).toBeTruthy();
    });

    it("should not set the nameCheck.providedNameDuplicate flag if the provided name does not match an existing profile", function () {
        checkNameDefer.resolve({
            matchedName: {
                fullName: "Acacia dealbata Link",
                guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            },
            matchedNameDuplicates: [],
            providedName: "Acacia dealbata",
            providedNameDuplicates: []
        });
        scope.name = "acacia dealbata";
        scope.opusId = "1234";

        scope.checkName();
        scope.$apply();

        expect(scope.nameCheck.providedNameDuplicate).toBeFalsy();
    });

    it("should not set the nameCheck.noMatch flag if the provided name does not match a known name", function () {
        checkNameDefer.resolve({
            matchedName: {},
            matchedNameDuplicates: [],
            providedName: "Acacia dealbata",
            providedNameDuplicates: []
        });
        scope.name = "acacia dealbata";
        scope.opusId = "1234";

        scope.checkName();
        scope.$apply();

        expect(scope.nameCheck.noMatch).toBeTruthy();
    });

    it("should not set the nameCheck.mismatch flag if the provided name does not exactly match a known name (i.e. a fuzzy match)", function () {
        checkNameDefer.resolve({
            matchedName: {
                fullName: "Acacia dealbata Link",
                guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            },
            matchedNameDuplicates: [],
            providedName: "Acacia dealbata",
            providedNameDuplicates: []
        });
        scope.name = "acacia dealbataaa";
        scope.opusId = "1234";

        scope.checkName();
        scope.$apply();

        expect(scope.nameCheck.mismatch).toBeTruthy();
    });

    it("should set the nameCheck.matchedNameDuplicate flag if the matched name matches an existing profile", function () {
        checkNameDefer.resolve({
            matchedName: {
                fullName: "Acacia dealbata Link",
                guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            },
            matchedNameDuplicates: [{
                fullName: "Acacia dealbata Link",
                profileId: "b484380d-4d04-4fcc-bb71-c38f33829ead",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            }],
            providedName: "Acacia dealbata",
            providedNameDuplicates: []
        });
        scope.name = "acacia dealbataaaa";
        scope.opusId = "1234";

        scope.checkName();
        scope.$apply();

        expect(scope.nameCheck.matchedNameDuplicate).toBeTruthy();
    });

    it("should not set the nameCheck.matchedNameDuplicate flag if the matched name does not match an existing profile", function () {
        checkNameDefer.resolve({
            matchedName: {
                fullName: "Acacia dealbata Link",
                guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            },
            matchedNameDuplicates: [],
            providedName: "Acacia dealbata",
            providedNameDuplicates: []
        });
        scope.name = "acacia dealbataaaa";
        scope.opusId = "1234";

        scope.checkName();
        scope.$apply();

        expect(scope.nameCheck.matchedNameDuplicate).toBeFalsy();
    });

    it("should set the new name to the matched name if useMatchedName is invoked", function () {
        scope.nameCheck = {
            matchedName: {
                scientificName: "matched"
            }
        };
        scope.name = "provided";

        scope.useMatchedName();
        scope.$apply();

        expect(scope.name).toBe("matched");
    });

    it("should toggle the showManualMatch flag and cancel the manual hierarchy view when toggleManualMatch is invoked", function () {
        scope.showManualMatch = false;
        scope.showManualHierarchy = true;
        scope.manualHierarchy = [{name: "1"}, {name: "2"}];

        scope.toggleManualMatch();
        scope.$apply();

        expect(scope.showManualMatch).toBeTruthy();
        expect(scope.showManualHierarchy).toBeFalsy();
        expect(scope.manualHierarchy.length).toBe(0);
    });

    it("should set the manually matched name and guid when onSelectManualMatch is invoked", function () {
        scope.onSelectManualMatch({name: "bla", guid: "1234"});
        scope.$apply();

        expect(scope.manuallyMatchedName).toBe("bla");
        expect(scope.manuallyMatchedGuid).toBe("1234");
    });

    it("should toggle the showManualHierarchy flag, clear the showManualMatch, and add the current name as the first item in the hierarchy when opening the manual hierarchy block", function () {
        scope.showManualMatch = true;
        scope.showManualHierarchy = false;
        scope.manualHierarchy = [];
        scope.name = "new profile";

        scope.toggleManualHierarchy();
        scope.$apply();

        expect(scope.showManualMatch).toBeFalsy();
        expect(scope.showManualHierarchy).toBeTruthy();
        expect(scope.manualHierarchy.length).toBe(1);
        expect(scope.manualHierarchy[0].name).toBe("new profile");
        expect(scope.manualHierarchy[0].checked).toBeTruthy();
        expect(scope.manualHierarchy[0].guid).toBeNull();
        expect(scope.manualHierarchy[0].rank).toBeNull();
    });

    it("should toggle the showManualHierarchy flag and empty the hierarchy when closing the manual hierarchy block", function () {
        scope.showManualHierarchy = true;
        scope.manualHierarchy = [{name: "1"}, {name: "2"}];

        scope.toggleManualHierarchy();
        scope.$apply();

        expect(scope.showManualHierarchy).toBeFalsy();
        expect(scope.manualHierarchy.length).toBe(0);
    });

    it("should set the name and clear the other fields of the hierarchy item when manualHierarchyValueChanged is invoked", function () {
        scope.manualHierarchy = [{name: "1"}, {name: "2", guid: "134", rank: "species", checked: true}];

        scope.providedHierarchyName = "new name";

        scope.manualHierarchyValueChanged(1);
        scope.$apply();

        expect(scope.manualHierarchy[0].name).toBe("1");
        expect(scope.manualHierarchy[1].name).toBe("new name");
        expect(scope.manualHierarchy[1].guid).toBeNull();
        expect(scope.manualHierarchy[1].rank).toBeNull();
        expect(scope.manualHierarchy[1].checked).toBeFalsy();
    });

    it("should remove all items above the selected index when trimManualHierarchy is invoked", function () {
        scope.manualHierarchy = [{name: "1"}, {name: "2"}, {name: "3"}, {name: "4"}];

        scope.trimManualHierarchy(2);
        scope.$apply();

        expect(scope.manualHierarchy.length).toBe(2);
        expect(scope.manualHierarchy[0].name).toBe("1");
        expect(scope.manualHierarchy[1].name).toBe("2");
    });

    it("should remove all items and close the hierarchy panel when trimManualHierarchy is invoked with index 0", function () {
        scope.showManualHierarchy = true;
        scope.manualHierarchy = [{name: "1"}, {name: "2"}, {name: "3"}, {name: "4"}];

        scope.trimManualHierarchy(0);
        scope.$apply();

        expect(scope.manualHierarchy.length).toBe(0);
        expect(scope.showManualHierarchy).toBeFalsy();
    });

    it("should set the valid flag to false if validate() is invoked when nameCheck is null", function () {
        scope.manualHierarchy = []; // empty is always valid
        scope.nameCheck = null;

        scope.validate();
        scope.$apply();

        expect(scope.valid).toBeFalsy();
    });

    it("should set the valid flag to false if validate() is invoked when there are provided name duplicates", function () {
        scope.manualHierarchy = []; // empty is always valid
        scope.nameCheck = {providedNameDuplicate: true};

        scope.validate();
        scope.$apply();

        expect(scope.valid).toBeFalsy();
    });

    it("should set the valid flag to false if validate() is invoked when the manual hierarchy is invalid", function () {
        scope.manualHierarchy = [
            {name: "bla", rank: null} // rank is mandatory
        ]; // empty is always valid
        scope.nameCheck = {providedNameDuplicate: false};

        scope.validate();
        scope.$apply();

        expect(scope.valid).toBeFalsy();
    });

    it("should set the valid flag to true if validate() is invoked when there are no provided name duplicates", function () {
        scope.manualHierarchy = []; // empty is always valid
        scope.nameCheck = {providedNameDuplicate: false};

        scope.validate();
        scope.$apply();

        expect(scope.valid).toBeTruthy();
    });

    it("should return true when validateHierarchy is invoked and there is no manual hierarchy", function () {
        scope.manualHierarchy = []; // empty is always valid

        var valid = scope.validateHierarchy();

        expect(valid).toBeTruthy();
    });

    it("should return true when validateHierarchy is invoked and there is a valid hierarchy", function () {
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r1", guid: "1234", checked: true} // only 1 item should have a guid
        ];

        var valid = scope.validateHierarchy();
        scope.$apply();

        expect(valid).toBeTruthy();
    });

    it("should return false when validateHierarchy is invoked and multiple items in the hierarchy have guids", function () {
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: "1234", checked: true},
            {name: "name2", rank: "r1", guid: "wrong", checked: true}
        ];

        var valid = scope.validateHierarchy();
        scope.$apply();

        expect(valid).toBeFalsy();
    });

    it("should return false when validateHierarchy is invoked and an item in the hierarchy has not been checked", function () {
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r1", guid: "1234", checked: false}
        ];

        var valid = scope.validateHierarchy();
        scope.$apply();

        expect(valid).toBeFalsy();
    });

    it("should return false when validateHierarchy is invoked and an item in the hierarchy has no name", function () {
        scope.manualHierarchy = [
            {name: "", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r1", guid: "1234", checked: true}
        ];

        var valid = scope.validateHierarchy();
        scope.$apply();

        expect(valid).toBeFalsy();
    });

    it("should return false when validateHierarchy is invoked and an item in the hierarchy has no rank", function () {
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: null, guid: "1234", checked: true}
        ];

        var valid = scope.validateHierarchy();
        scope.$apply();

        expect(valid).toBeFalsy();
    });

    it("should set the details of the specified hierarchy item to the provided name when onSelectManualHierarchy is invoked", function () {
        // this path happens when the user selects an item from the autocomplete list
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r1", guid: "1234", checked: false}
        ];

        scope.onSelectManualHierarchy(1, {profileId: "p1", scientificName: "sciName1", rank: "rank1"});
        scope.$apply();

        expect(scope.manualHierarchy[1].name).toBe("sciName1");
        expect(scope.manualHierarchy[1].guid).toBe("p1");
        expect(scope.manualHierarchy[1].rank).toBe("rank1");
        expect(scope.manualHierarchy[1].profile).toBeTruthy();
        expect(scope.manualHierarchy[1].checked).toBeTruthy();
    });

    it("should clear the providedHierarchyName field after onSelectManualHierarchy is invoked with a selected object", function () {
        // this path happens when the user selects an item from the autocomplete list
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r1", guid: "1234", checked: false}
        ];

        scope.onSelectManualHierarchy(1, {profileId: "p1", scientificName: "sciName1", rank: "rank1"});
        scope.$apply();

        expect(scope.providedHierarchyName).toBeNull();
    });

    it("should remove all items below the edited hierarchy after onSelectManualHierarchy is invoked with a selected object", function () {
        // this path happens when the user selects an item from the autocomplete list
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r2", guid: "1234", checked: true},
            {name: "name3", rank: "r3", guid: "1234", checked: true},
            {name: "name4", rank: "r4", guid: "1234", checked: true}
        ];

        scope.onSelectManualHierarchy(1, {profileId: "p1", scientificName: "sciName1", rank: "rank1"});
        scope.$apply();

        expect(scope.manualHierarchy.length).toBe(2);
        expect(scope.manualHierarchy[0].name).toBe("name1");
        expect(scope.manualHierarchy[1].name).toBe("sciName1");
    });

    it("should look for a Profile with the entered name when onSelectManualHierarchy is invoked but no item was selected from the autocomplete", function () {
        // this path happens when the user enters a profile name but does not actually select it from the autocomplete list
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r1", guid: "1234", checked: false}
        ];
        scope.providedHierarchyName = "Acacia dealbata";
        profileSearchDefer.resolve([{
            fullName: "Acacia dealbata Link",
            guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
            nameAuthor: "Link",
            opus: {"shortName": "foa", "title": "Flora of Australia", "uuid": "8aa27a28-e38f-4048-8349-9102e5164948"},
            profileId: "b484380d-4d04-4fcc-bb71-c38f33829ead",
            rank: "species",
            scientificName: "Acacia dealbata"
        }]);

        scope.onSelectManualHierarchy(1);
        scope.$apply();

        expect(profileService.checkName).not.toHaveBeenCalled();
        expect(scope.manualHierarchy[1].name).toBe("Acacia dealbata");
        expect(scope.manualHierarchy[1].guid).toBe("b484380d-4d04-4fcc-bb71-c38f33829ead");
        expect(scope.manualHierarchy[1].rank).toBe("species");
        expect(scope.manualHierarchy[1].profile).toBeFalsy();
        expect(scope.manualHierarchy[1].checked).toBeTruthy();

        expect(scope.providedHierarchyName).toBeNull();
    });

    it("should look for a Name with the entered name when onSelectManualHierarchy is invoked but no item was selected from the autocomplete and the provided text did not match a profile", function () {
        // this path happens when the user enters a profile name but does not actually select it from the autocomplete list
        scope.manualHierarchy = [
            {name: "name1", rank: "r1", guid: null, checked: true},
            {name: "name2", rank: "r1", guid: "1234", checked: false}
        ];
        scope.providedHierarchyName = "Acacia dealbata";
        profileSearchDefer.resolve({});
        checkNameDefer.resolve({
            matchedName: {
                fullName: "Acacia dealbata Link",
                guid: "urn:lsid:biodiversity.org.au:apni.taxon:296831",
                nameAuthor: null,
                rank: "species",
                scientificName: "Acacia dealbata"
            },
            matchedNameDuplicates: [],
            providedName: "Acacia dealbata",
            providedNameDuplicates: []
        });

        scope.onSelectManualHierarchy(1);
        scope.$apply();

        expect(scope.manualHierarchy[1].name).toBe("Acacia dealbata");
        expect(scope.manualHierarchy[1].guid).toBe("urn:lsid:biodiversity.org.au:apni.taxon:296831");
        expect(scope.manualHierarchy[1].rank).toBe("species");
        expect(scope.manualHierarchy[1].profile).toBeFalsy();
        expect(scope.manualHierarchy[1].checked).toBeTruthy();

        expect(scope.providedHierarchyName).toBeNull();
    });
});
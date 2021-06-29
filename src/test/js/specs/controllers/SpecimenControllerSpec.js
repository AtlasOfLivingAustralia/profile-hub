describe("SpecimenController tests", function () {
    var controller;
    var scope;

    var messageService;
    var profileService;
    var profileDefer, lookupDefer, updateDefer;

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "specimenIds":["e0fd3aca-7b21-44de-abe4-6b392cd32aae"]}, "opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}}}';

    beforeAll(function () {
        console.log("****** Specimen Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_, _util_) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        profileDefer = $q.defer();
        lookupDefer = $q.defer();
        updateDefer = $q.defer();

        spyOn(profileService, "getProfile").and.returnValue(profileDefer.promise);
        spyOn(profileService, "updateProfile").and.returnValue(updateDefer.promise);
        spyOn(profileService, "lookupSpecimenDetails").and.returnValue(lookupDefer.promise);

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("SpecimenController as ctrl", {
            $scope: scope,
            profileService: profileService,
            util: _util_,
            messageService: messageService
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

    it("should set the profile attribute of the current scope when the controller loads", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.$apply();

        expect(scope.ctrl.profile).toBeDefined();
    });

    it("should populate the specimen details from the server when the profile loads", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        // this is the required data from the biocache occurrence web service (biocache.ala.org.au/ws/occurrences/<specimen uuid>
        lookupDefer.resolve({
                processed: {
                    attribution: {
                        collectionName: "collectionName",
                        collectionUid: "colUid",
                        institutionName: "institutionName",
                        institutionUid: "instUid"
                    }
                }, raw: {occurrence: {catalogNumber: "catNo"}}
        });

        scope.$apply();

        expect(scope.ctrl.specimens).toBeDefined();
        expect(scope.ctrl.specimens.length).toBeDefined(0);
        expect(scope.ctrl.specimens[0].id).toBe("e0fd3aca-7b21-44de-abe4-6b392cd32aae");
        expect(scope.ctrl.specimens[0].collectionName).toBe("collectionName");
        expect(scope.ctrl.specimens[0].collectionUid).toBe("colUid");
        expect(scope.ctrl.specimens[0].institutionName).toBe("institutionName");
        expect(scope.ctrl.specimens[0].institutionUid).toBe("instUid");
        expect(scope.ctrl.specimens[0].catalogNumber).toBe("catNo");
    });

    it("should use the raw occurrence institutionCode if the processed attribution does not contain an institution name", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        lookupDefer.resolve({
                processed: {
                    attribution: {}
                }, raw: {
                    occurrence: {
                        institutionCode: "inst code"
                    }
                }
        });

        scope.$apply();

        expect(scope.ctrl.specimens).toBeDefined();
        expect(scope.ctrl.specimens.length).toBeDefined(0);
        expect(scope.ctrl.specimens[0].id).toBe("e0fd3aca-7b21-44de-abe4-6b392cd32aae");
        expect(scope.ctrl.specimens[0].institutionName).toBe("inst code");
    });

    it("should replace the profile's specimenIds list with the ids from the specimens list when the profile is saved", function() {
        scope.ctrl.specimens = [{id: "spec1"}, {id: "spec2"}];
        scope.ctrl.profile = {uuid: "profileId", specimenIds: ["id1", "id2"]};
        scope.ctrl.opusId = "opusId";

        scope.ctrl.save();

        expect(profileService.updateProfile).toHaveBeenCalledWith("opusId", "profileId", {uuid: "profileId", specimenIds: ["spec1", "spec2"]});
    });

    it("should add a new empty specimen to the specimens list when addSpecimen is invoked", function() {
        scope.ctrl.specimens = [{id: "spec1"}];

        scope.ctrl.addSpecimen(form);

        expect(scope.ctrl.specimens.length).toBe(2);
        expect(scope.ctrl.specimens[0].id).toBe("spec1");
        expect(scope.ctrl.specimens[1].id).toBe("");
        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should remove the specified item from the specimens list, but not from the profile's specimenIds list, when deleteSpecimen is invoked", function() {
        scope.ctrl.profile = {specimenIds: ["spec1", "spec2", "spec3"]};
        scope.ctrl.specimens = [{id: "spec1"}, {id: "spec2"}, {id: "spec3"}];

        scope.ctrl.deleteSpecimen(1, form);

        expect(scope.ctrl.specimens.length).toBe(2);
        expect(scope.ctrl.profile.specimenIds.length).toBe(3);
        expect(scope.ctrl.specimens[0].id).toBe("spec1");
        expect(scope.ctrl.specimens[1].id).toBe("spec3");
        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should set the form to pristine if the specimens and profile.specimenIds lists are both empty after a delete", function() {
        // i.e., the user has added the first specimen for the profile, then deleted it, so there is nothing to save
        scope.ctrl.profile = {specimenIds: []};

        scope.ctrl.specimens = [{id: "spec1"}];

        scope.ctrl.deleteSpecimen(0, form);

        expect(form.$setPristine).toHaveBeenCalled();
    });

    it("should set the form to pristine if the specimens is empty and the profile.specimenIds is undefined after a delete", function() {
        // i.e., the user has added the first specimen for the profile, then deleted it, so there is nothing to save
        scope.ctrl.profile = {};

        scope.ctrl.specimens = [{id: "spec1"}];

        scope.ctrl.deleteSpecimen(0, form);

        expect(form.$setPristine).toHaveBeenCalled();
    });

    it("should consider no new or old specimens as invalid so the save button is disabled", function() {
        scope.ctrl.profile = {specimenIds: []};
        scope.ctrl.specimens = [];

        var valid = scope.ctrl.isValid();

        expect(valid).toBeFalsy();
    });

    it("should consider no new or old specimens as valid so the save button is disabled", function() {
        scope.ctrl.profile = {};
        scope.ctrl.specimens = [];

        var valid = scope.ctrl.isValid();

        expect(valid).toBeFalsy();
    });

    it("should only consider specimens with a valid UUID as the id attribute to be valid", function() {
        scope.ctrl.specimens = [{id: "e0fd3aca-7b21-44de-abe4-6b392cd32aae"}, {id: "e0fd3aca-7b21-44de-abe4-6b392cd32222"}];

        var valid = scope.ctrl.isValid();

        expect(valid).toBeTruthy();

        scope.ctrl.specimens = [{id: "e0fd3aca-7b21-44de-abe4-6b392cd32aae"}, {id: "invalid"}];

        var valid = scope.ctrl.isValid();

        expect(valid).toBeFalsy();

        scope.ctrl.specimens = [{id: "e0fd3aca-7b21-44de-abe4-6b392cd32aae"}, {id: undefined}];

        var valid = scope.ctrl.isValid();

        expect(valid).toBeFalsy();
    });

    it("should extract the occurrence id from the pasted biocache url when lookupSpecimenDetails is invoked", function() {
        scope.ctrl.lookupSpecimenDetails(0, null, "http://blabla.com/bla/e0fd3aca-7b21-44de-abe4-6b392cd32222");

        expect(profileService.lookupSpecimenDetails).toHaveBeenCalledWith("e0fd3aca-7b21-44de-abe4-6b392cd32222");
    });

    it("should not invoke the lookup service if the URL does not end with a valid UUID when lookupSpecimenDetails is invoked", function() {
        scope.ctrl.lookupSpecimenDetails(0, null, "http://blabla.com/bla/invalid");

        expect(profileService.lookupSpecimenDetails).not.toHaveBeenCalled();
    });
});
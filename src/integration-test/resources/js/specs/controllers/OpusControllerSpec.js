describe("OpusController tests", function () {
    var OPUS_ID = "281ff2a5-e8d9-43ff-aff9-e20144b6a94c";
    var controller;
    var scope;
    var mockUtil = {
        getPathItem: function () {
            return OPUS_ID;
        },
        getEntityId: function (str) {
            if (str == "opus") {
                return OPUS_ID
            } else if (str == "profile") {
                return "profileId1"
            }
        },
        isUuid: function () {
            return true;
        },
        LAST: "last",
        contextRoot: function () {
            return "/contextRoot";
        },
        redirect: function (location) {
        }
    };
    var form;
    var messageService;
    var profileService;
    var opusDefer, getResourceDefer, saveOpusDefer, listOpusDefer, getListsDefer, keysDefer, supportingCollectionDefer, hubsDefer, resourcesDefer, tagsDefer;

    var getOpusResponse = '{"title": "OpusName", "dataResourceUid":"dataUid1", "mapConfig": {"mapPointColour": "12345"}, "dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2", "source3"]}, "recordSources": ["source1", "source2", "source3"], "supportingOpuses": []}';
    var getResourceResponse = '{"pubDescription":"resource description"}';
    var listHubsResponse = '{"dh1": "hub1", "dh2": "hub2", "dh3": "hub3", "dh4": "hub4"}';
    var listResourcesResponse = '{"dr1": "resource1", "dr2": "resource2", "dr3": "resource3", "dr4": "resource4"}';

    beforeAll(function () {
        console.log("****** Opus Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        opusDefer = $q.defer();
        getResourceDefer = $q.defer();
        saveOpusDefer = $q.defer();
        listOpusDefer = $q.defer();
        getListsDefer = $q.defer();
        keysDefer = $q.defer();
        supportingCollectionDefer = $q.defer();
        hubsDefer = $q.defer();
        resourcesDefer = $q.defer();
        tagsDefer = $q.defer();

        spyOn(profileService, "getTags").and.returnValue(tagsDefer.promise);
        spyOn(profileService, "getOpus").and.returnValue(opusDefer.promise);
        spyOn(profileService, "getResource").and.returnValue(getResourceDefer.promise);
        spyOn(profileService, "listResources").and.returnValue(resourcesDefer.promise);
        spyOn(profileService, "listHubs").and.returnValue(hubsDefer.promise);
        spyOn(profileService, "saveOpus").and.returnValue(saveOpusDefer.promise);
        spyOn(profileService, "listOpus").and.returnValue(listOpusDefer.promise);
        spyOn(profileService, "getAllLists").and.returnValue(getListsDefer.promise);
        spyOn(profileService, "retrieveKeybaseProjects").and.returnValue(keysDefer.promise);
        spyOn(profileService, "updateSupportingCollections").and.returnValue(supportingCollectionDefer.promise);

        spyOn(mockUtil, "redirect").and.returnValue(null);

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("OpusController as opusCtrl", {
            $scope: scope,
            profileService: profileService,
            util: mockUtil,
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

    it("should set the opus attribute of the current scope when the controller is loaded", function () {
        opusDefer.resolve(JSON.parse(getOpusResponse));
        scope.opusCtrl.loadOpus();
        scope.$apply();

        expect(profileService.getOpus).toHaveBeenCalled();
        expect(scope.opusCtrl.opus).toBeDefined();
    });

    it("should set the opus data resource on the scope when the controller loads", function () {
        opusDefer.resolve(JSON.parse(getOpusResponse));
        getResourceDefer.resolve(JSON.parse(getResourceResponse));

        scope.opusCtrl.loadOpus();
        scope.$apply();

        expect(scope.opusCtrl.dataResource).toBeDefined();
        expect(scope.opusCtrl.dataResource.pubDescription).toBe("resource description");
    });

    it("should raise an alert message when the call to getOpus fails", function () {
        opusDefer.reject();

        scope.opusCtrl.loadOpus();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the opus.");
    });

    it("should create a new empty supporting opus record when addSupportingOpus is invoked", function () {
        scope.opusCtrl.addSupportingOpus();

        expect(scope.opusCtrl.newSupportingOpuses.length).toBe(1);
    });

    it("should create a new empty approved list record when addApprovedList is invoked", function () {
        scope.opusCtrl.addApprovedList();

        expect(scope.opusCtrl.newApprovedLists.length).toBe(1);
    });

    it("should create a new empty bio status list record when addFeatureList is invoked", function () {
        scope.opusCtrl.addFeatureList();

        expect(scope.opusCtrl.newFeatureLists.length).toBe(1);
    });

    it("should not add more than one bio status", function () {
        scope.opusCtrl.opus = {featureLists: ["list1"]};
        scope.opusCtrl.addFeatureList();

        expect(scope.opusCtrl.newFeatureLists.length).toBe(1);
    });

    it("should remove an existing supporting opus from the opus when removeSupportingOpus is invoked with 'existing'", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        scope.$apply();
        scope.opusCtrl.supportingOpuses = [{opusId: "opus1", title: "Opus 1"}, {
            opusId: "opus2",
            title: "Opus 2"
        }, {opusId: "opus3", title: "Opus 3"}];

        scope.$apply();
        scope.opusCtrl.removeSupportingOpus(1, 'existing', form);

        expect(scope.opusCtrl.supportingOpuses.length).toBe(2);
        expect(scope.opusCtrl.supportingOpuses[0].opusId).toBe("opus1");
        expect(scope.opusCtrl.supportingOpuses[1].opusId).toBe("opus3");
    });

    it("should remove a supportingOpus from the list of new supportingOpuses when removeSupportingOpus is invoked with 'new'", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        scope.$apply();
        scope.opusCtrl.supportingOpuses = [{opusId: "opus1", title: "Opus 1"}, {
            opusId: "opus2",
            title: "Opus 2"
        }, {opusId: "opus3", title: "Opus 3"}];

        scope.$apply();
        scope.opusCtrl.newSupportingOpuses = [{opusId: "opus1", title: "Opus 1"}, {
            opusId: "opus2",
            title: "Opus 2"
        }, {opusId: "opus3", title: "Opus 3"}];
        scope.opusCtrl.removeSupportingOpus(1, 'new', form);

        expect(scope.opusCtrl.supportingOpuses.length).toBe(3);
        expect(scope.opusCtrl.newSupportingOpuses.length).toBe(2);
        expect(scope.opusCtrl.newSupportingOpuses[0].opusId).toBe("opus1");
        expect(scope.opusCtrl.newSupportingOpuses[1].opusId).toBe("opus3");
    });

    it("should remove an existing approved list from the opus when removeApprovedList is invoked with 'existing'", function () {
        scope.opusCtrl.opus = {approvedLists: ["list1", "list2", "list3"]};

        scope.$apply();
        scope.opusCtrl.removeApprovedList(1, 'existing', form);

        expect(scope.opusCtrl.opus.approvedLists.length).toBe(2);
        expect(scope.opusCtrl.opus.approvedLists[0]).toBe("list1");
        expect(scope.opusCtrl.opus.approvedLists[1]).toBe("list3");
    });

    it("should remove an approved list from the list of new approved lists when removeApprovedList is invoked with 'new'", function () {
        scope.opusCtrl.opus = {approvedLists: ["list1", "list2", "list3"]};

        scope.opusCtrl.newApprovedLists = ["list4", "list5", "list6"];
        scope.opusCtrl.removeApprovedList(1, 'new', form);

        expect(scope.opusCtrl.opus.approvedLists.length).toBe(3);
        expect(scope.opusCtrl.newApprovedLists.length).toBe(2);
        expect(scope.opusCtrl.newApprovedLists[0]).toBe("list4");
        expect(scope.opusCtrl.newApprovedLists[1]).toBe("list6");
    });

    it("should remove an existing bio status list from the opus when removeFeatureList is invoked with 'existing'", function () {
        scope.opusCtrl.opus = {featureLists: ["list1", "list2", "list3"]};

        scope.$apply();
        scope.opusCtrl.removeFeatureList(1, 'existing', form);

        expect(scope.opusCtrl.opus.featureLists.length).toBe(2);
        expect(scope.opusCtrl.opus.featureLists[0]).toBe("list1");
        expect(scope.opusCtrl.opus.featureLists[1]).toBe("list3");
    });

    it("should remove an bio status list from the list of new bio status lists when removeFeatureList is invoked with 'new'", function () {
        scope.opusCtrl.opus = {featureLists: ["list1", "list2", "list3"]};

        scope.opusCtrl.newFeatureLists = ["list4", "list5", "list6"];
        scope.opusCtrl.removeFeatureList(1, 'new', form);

        expect(scope.opusCtrl.opus.featureLists.length).toBe(3);
        expect(scope.opusCtrl.newFeatureLists.length).toBe(2);
        expect(scope.opusCtrl.newFeatureLists[0]).toBe("list4");
        expect(scope.opusCtrl.newFeatureLists[1]).toBe("list6");
    });

    it("should set the form to Dirty removeSupportingOpus is invoked", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        scope.$apply();

        scope.opusCtrl.opus.supportingOpuses = [{opusId: "opus1", title: "Opus 1"}, {
            opusId: "opus2",
            title: "Opus 2"
        }, {opusId: "opus3", title: "Opus 3"}];
        scope.opusCtrl.newSupportingOpuses = [{opusId: "opus1", title: "Opus 1"}, {
            opusId: "opus2",
            title: "Opus 2"
        }, {opusId: "opus3", title: "Opus 3"}];
        scope.opusCtrl.removeSupportingOpus(1, 'new', form);

        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should merge newSupportingOpuses with the existing supporting opuses when saveSupportingOpus is called", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        scope.opusCtrl.opusId = OPUS_ID;

        scope.$apply();
        scope.opusCtrl.supportingOpuses = [{uuid: "opus1", title: "Opus 1"}];
        scope.opusCtrl.newSupportingOpuses = [{opus: {uuid: "opus2", title: "Opus 2"}}];

        scope.opusCtrl.saveSupportingOpuses(form);

        var expectedData = {
            supportingOpuses: [{uuid: "opus1", title: "Opus 1"}, {uuid: "opus2", title: "Opus 2"}]
        };

        expect(profileService.updateSupportingCollections).toHaveBeenCalledWith(OPUS_ID, expectedData);
    });

    it("should validate that supporting opuses have an associated opus object with and id", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        scope.opusCtrl.opusId = OPUS_ID;
        scope.$apply();

        scope.opusCtrl.newSupportingOpuses = [{opus: {title: "bla"}}];

        scope.opusCtrl.saveSupportingOpuses(form);

        expect(profileService.saveOpus).not.toHaveBeenCalledWith();
        expect(messageService.alert).toHaveBeenCalledWith("1 supporting collection is not valid. You must select items from the list.");
    });

    it("should save the opus if no new supporting opuses have been added but existing ones have been removed", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        scope.opusCtrl.opusId = OPUS_ID;
        scope.$apply();
        scope.opusCtrl.supportingOpuses = [{uuid: "opus1", title: "Opus 1"}, {
            uuid: "opus2",
            title: "Opus 2"
        }, {uuid: "opus3", title: "Opus 3"}];

        scope.opusCtrl.removeSupportingOpus(1, 'existing', form);
        scope.opusCtrl.saveSupportingOpuses(form);

        var expectedData = {
            supportingOpuses: [{uuid: "opus1", title: "Opus 1"}, {uuid: "opus3", title: "Opus 3"}]
        };

        expect(profileService.updateSupportingCollections).toHaveBeenCalledWith(OPUS_ID, expectedData);
    });

    it("should include the data sharing flags in the call to updateSupportingCollections if they have been defined", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        scope.opusCtrl.opus.autoApproveShareRequests = true;
        scope.opusCtrl.opus.allowCopyFromLinkedOpus = true;
        scope.opusCtrl.opus.showLinkedOpusAttributes = true;
        scope.opusCtrl.opusId = OPUS_ID;
        scope.$apply();
        scope.opusCtrl.supportingOpuses = [{uuid: "opus1", title: "Opus 1"}, {
            uuid: "opus2",
            title: "Opus 2"
        }, {uuid: "opus3", title: "Opus 3"}];

        scope.opusCtrl.removeSupportingOpus(1, 'existing', form);
        scope.opusCtrl.saveSupportingOpuses(form);

        var expectedData = {
            supportingOpuses: [{uuid: "opus1", title: "Opus 1"}, {uuid: "opus3", title: "Opus 3"}],
            autoApproveShareRequests: true,
            allowCopyFromLinkedOpus: true,
            showLinkedOpusAttributes: true
        };

        expect(profileService.updateSupportingCollections).toHaveBeenCalledWith(OPUS_ID, expectedData);
    });

    it("should merge newApprovedLists with the existing approvedLists when saveApprovedLists is called", function () {
        scope.opusCtrl.opus = {
            title: "OpusName",
            approvedLists: ["list1", "list2", "list3"],
            dataResourceConfig: {recordSources: [], imageSources: []}
        };
        scope.opusCtrl.newApprovedLists = [{list: {dataResourceUid: "list4"}}, {list: {dataResourceUid: "list5"}}, {list: {dataResourceUid: "list6"}}];
        scope.opusCtrl.opusId = OPUS_ID;

        scope.opusCtrl.saveApprovedLists(form);

        var expectedOpus = {
            title: "OpusName",
            approvedLists: ["list1", "list2", "list3", "list4", "list5", "list6"],
            keybaseProjectId: "",
            keybaseKeyId: "",
            dataResourceConfig: {recordSources: [], imageSources: []}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith(OPUS_ID, expectedOpus);
    });

    it("should validate that approved lists have an associated dataResourceUid", function () {
        scope.opusCtrl.opusId = OPUS_ID;

        scope.opusCtrl.newApprovedLists = [{list: {listName: "list1"}}];

        scope.opusCtrl.saveApprovedLists(form);

        expect(profileService.saveOpus).not.toHaveBeenCalledWith();
        expect(messageService.alert).toHaveBeenCalledWith("1 list is not valid. You must select items from the list.");
    });

    it("should save the opus if no new approved lists have been added but existing ones have been removed", function () {
        scope.opusCtrl.opus = {title: "OpusName", approvedLists: ["list1", "list2", "list3"], dataResourceConfig: {recordSources: [], imageSources: []}};
        scope.opusCtrl.opusId = OPUS_ID;

        scope.opusCtrl.removeApprovedList(1, 'existing', form);
        scope.opusCtrl.saveApprovedLists(form);

        var expectedOpus = {
            title: "OpusName",
            approvedLists: ["list1", "list3"],
            keybaseProjectId: "",
            keybaseKeyId: "",
            dataResourceConfig: {recordSources: [], imageSources: []}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith(OPUS_ID, expectedOpus);
    });

    it("should merge newFeatureLists with the existing featureLists when saveFeatureLists is called", function () {
        scope.opusCtrl.opus = {title: "OpusName", featureLists: [], dataResourceConfig: {recordSources: [], imageSources: []}};
        scope.opusCtrl.newFeatureLists = [{list: {dataResourceUid: "list4"}}];
        scope.opusCtrl.opusId = OPUS_ID;

        scope.opusCtrl.saveFeatureLists(form);

        var expectedOpus = {
            title: "OpusName",
            featureLists: ["list4"],
            keybaseProjectId: "",
            keybaseKeyId: "",
            dataResourceConfig: {recordSources: [], imageSources: []}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith(OPUS_ID, expectedOpus);
    });

    it("should validate that bio status lists have an associated dataResourceUid", function () {
        scope.opusCtrl.opusId = OPUS_ID;

        scope.opusCtrl.newFeatureLists = [{list: {listName: "list1"}}];

        scope.opusCtrl.saveFeatureLists(form);

        expect(profileService.saveOpus).not.toHaveBeenCalledWith();
        expect(messageService.alert).toHaveBeenCalledWith("1 list is not valid. You must select items from the list.");
    });

    it("should save the opus if no new bio status lists have been added but existing ones have been removed", function () {
        scope.opusCtrl.opus = {title: "OpusName", featureLists: ["list1"], dataResourceConfig: {recordSources: [], imageSources: []}};
        scope.opusCtrl.opusId = OPUS_ID;

        scope.opusCtrl.removeFeatureList(0, 'existing', form);
        scope.opusCtrl.saveFeatureLists(form);

        var expectedOpus = {
            title: "OpusName",
            featureLists: [],
            keybaseProjectId: "",
            keybaseKeyId: "",
            dataResourceConfig: {recordSources: [], imageSources: []}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith(OPUS_ID, expectedOpus);
    });

    it("should raise an alert message if the call to saveOpus fails", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        saveOpusDefer.reject();
        scope.$apply();
        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("Failed to update OpusName.");
    });

    it("should raise a success message and set the form to pristine if the call to saveOpus succeeds", function () {
        scope.opusCtrl.opus = JSON.parse(getOpusResponse);
        saveOpusDefer.resolve({});
        scope.$apply();
        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        expect(messageService.success).toHaveBeenCalledWith("Successfully updated OpusName.");
        expect(form.$setPristine).toHaveBeenCalled();
    });

    it("should check for duplicate short names when saving the opus", function () {
        scope.opusCtrl.initialShortName = "oldShortName";
        scope.opusCtrl.opus = {shortName: "newShortName"};

        scope.opusCtrl.saveOpus(form);

        expect(profileService.getOpus).toHaveBeenCalledWith("newShortName", true);
    });

    it("should only check for duplicate short names when saving the opus if the short name has changed", function () {
        scope.opusCtrl.initialShortName = "oldShortName";
        scope.opusCtrl.opus = {shortName: "oldShortName", dataResourceConfig: {recordSources: [], imageSources: []}};

        scope.opusCtrl.saveOpus(form);

        expect(profileService.getOpus).not.toHaveBeenCalledWith();
    });

    it("should raise an alert message if there is another opus with the same shortName when saving the opus", function () {
        scope.opusCtrl.initialShortName = "oldShortName";
        scope.opusCtrl.opus = {shortName: "newShortName"};

        opusDefer.resolve({shortName: "newShortName"});
        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("The specified short name is already in use. Short Names must be unique across all collections.");
    });

    it("should save the opus if there are no other opuses with the same shortName when saving the opus", function () {
        scope.opusCtrl.initialShortName = "oldShortName";
        scope.opusCtrl.opus = {shortName: "newShortName", dataResourceConfig: {recordSources: [], imageSources: []}};

        opusDefer.reject({status: 404});
        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        expect(profileService.saveOpus).toHaveBeenCalled();
    });

    it("should redirect to the update opus page after creating a new opus", function () {
        scope.opusCtrl.opus = {dataResourceConfig: {recordSources: [], imageSources: []}};

        var newUuid = "123456";
        saveOpusDefer.resolve({uuid: newUuid});

        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        expect(mockUtil.redirect).toHaveBeenCalledWith("/contextRoot/opus/" + newUuid + "/update");
    });

    it("should stay on the same page after updating an exiting new opus", function () {
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {recordSources: [], imageSources: []}};

        saveOpusDefer.resolve({uuid: "123456"});

        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        expect(mockUtil.redirect).not.toHaveBeenCalled();
    });

    it("should populate the image source list on the opus from the list of selected sources, when using the HUBS option",function() {
        scope.opusCtrl.opusId = "123456";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {recordSources: [], imageSources: [], imageResourceOption: "HUBS"}};

        scope.opusCtrl.imageHubMultiSelectOptions = {
            selectedItems: [{"name": "hub1", "id": "dh1"}, {"name": "hub2", "id": "dh2"}]
        };

        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        var expectedOpus = {
            uuid: "123456", keybaseProjectId: '', keybaseKeyId: '',
            dataResourceConfig: {recordSources: [], imageSources: ["dh1", "dh2"], imageResourceOption: 'HUBS'}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith("123456", expectedOpus);
    });

    it("should populate the image source list on the opus from the list of selected sources, when using the RESOURCES option",function() {
        scope.opusCtrl.opusId = "123456";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {recordSources: [], imageSources: [], imageResourceOption: "RESOURCES"}};

        scope.opusCtrl.imageResourceMultiSelectOptions = {
            selectedItems: [{"name": "resource1", "id": "dr1"}, {"name": "resource2", "id": "dr2"}]
        };

        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        var expectedOpus = {
            uuid: "123456", keybaseProjectId: '', keybaseKeyId: '',
            dataResourceConfig: {recordSources: [], imageSources: ["dr1", "dr2"], imageResourceOption: 'RESOURCES'}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith("123456", expectedOpus);
    });

    it("should populate the record source list on the opus from the list of selected sources, when using the HUBS option",function() {
        scope.opusCtrl.opusId = "123456";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {imageSources: [], recordSources: [], recordResourceOption: "HUBS"}};

        scope.opusCtrl.recordHubMultiSelectOptions = {
            selectedItems: [{"name": "hub1", "id": "dh1"}, {"name": "hub2", "id": "dh2"}]
        };

        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        var expectedOpus = {
            uuid: "123456", keybaseProjectId: '', keybaseKeyId: '',
            dataResourceConfig: {imageSources: [], recordSources: ["dh1", "dh2"], recordResourceOption: 'HUBS'}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith("123456", expectedOpus);
    });

    it("should populate the record source list on the opus from the list of selected sources, when using the RESOURCES option",function() {
        scope.opusCtrl.opusId = "123456";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {imageSources: [], recordSources: [], recordResourceOption: "RESOURCES"}};

        scope.opusCtrl.recordResourceMultiSelectOptions = {
            selectedItems: [{"name": "resource1", "id": "dr1"}, {"name": "resource2", "id": "dr2"}]
        };

        scope.opusCtrl.saveOpus(form);
        scope.$apply();

        var expectedOpus = {
            uuid: "123456", keybaseProjectId: '', keybaseKeyId: '',
            dataResourceConfig: {imageSources: [], recordSources: ["dr1", "dr2"], recordResourceOption: 'RESOURCES'}
        };

        expect(profileService.saveOpus).toHaveBeenCalledWith("123456", expectedOpus);
    });

    it("should reset the record data source config to the original values from the opus, HUBS option", function() {
        scope.RecordForm = form;
        hubsDefer.resolve(JSON.parse(listHubsResponse));

        scope.opusCtrl.originalRecordResourceOption = "HUBS";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {imageSources: [], recordSources: ["dh1", "dh2"], recordResourceOption: "HUBS"}};

        scope.opusCtrl.recordHubMultiSelectOptions = {
            selectedItems: [{name: "hub1", id: "dh1"}], // only 1 selected: simulates the user removing an item before switching types
            items: [{name: "hub2", id: "dh2"}, {name: "hub3", id: "dh3"}, {name: "hub4", id: "dh4"}]
        };

        // simulate modifying the record config by selecting the ALL option
        scope.opusCtrl.opus.dataResourceConfig.recordResourceOption = "ALL";
        scope.opusCtrl.resetRecordSources();
        scope.$apply();

        expect(scope.opusCtrl.opus.dataResourceConfig.recordResourceOption).toBe("HUBS");
        expect(scope.opusCtrl.recordHubMultiSelectOptions.selectedItems).toEqual([{name: "hub1", id: "dh1"}, {name: "hub2", id: "dh2"}]);
    });

    it("should reset the record data source config to the original values from the opus, RESOURCES option", function() {
        scope.RecordForm = form;
        resourcesDefer.resolve(JSON.parse(listResourcesResponse));

        scope.opusCtrl.originalRecordResourceOption = "RESOURCES";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {imageSources: [], recordSources: ["dr1", "dr2"], recordResourceOption: "RESOURCES"}};

        scope.opusCtrl.recordResourceMultiSelectOptions = {
            selectedItems: [{name: "resource1", id: "dr1"}, {name: "resource2", id: "dr2"}],
            items: [{name: "resource3", id: "dr3"}, {name: "resource4", id: "dr4"}]
        };

        // simulate modifying the record config by selecting the ALL option
        scope.opusCtrl.opus.dataResourceConfig.recordResourceOption = "ALL";
        scope.opusCtrl.resetRecordSources();
        scope.$apply();

        expect(scope.opusCtrl.opus.dataResourceConfig.recordResourceOption).toBe("RESOURCES");
        expect(scope.opusCtrl.recordResourceMultiSelectOptions.selectedItems).toEqual([{name: "resource1", id: "dr1"}, {name: "resource2", id: "dr2"}]);
    });
    it("should reset the image data source config to the original values from the opus, HUBS option", function() {
        scope.ImageForm = form;
        hubsDefer.resolve(JSON.parse(listHubsResponse));

        scope.opusCtrl.originalImageResourceOption = "HUBS";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {recordSources: [], imageSources: ["dh1", "dh2"], imageResourceOption: "HUBS"}};

        scope.opusCtrl.imageHubMultiSelectOptions = {
            selectedItems: [{name: "hub1", id: "dh1"}], // only 1 selected: simulates the user removing an item before switching types
            items: [{name: "hub2", id: "dh2"}, {name: "hub3", id: "dh3"}, {name: "hub4", id: "dh4"}]
        };

        // simulate modifying the image config by selecting the ALL option
        scope.opusCtrl.opus.dataResourceConfig.imageResourceOption = "ALL";
        scope.opusCtrl.resetImageSources();
        scope.$apply();

        expect(scope.opusCtrl.opus.dataResourceConfig.imageResourceOption).toBe("HUBS");
        expect(scope.opusCtrl.imageHubMultiSelectOptions.selectedItems).toEqual([{name: "hub1", id: "dh1"}, {name: "hub2", id: "dh2"}]);
    });

    it("should reset the image data source config to the original values from the opus, RESOURCES option", function() {
        scope.ImageForm = form;
        resourcesDefer.resolve(JSON.parse(listResourcesResponse));

        scope.opusCtrl.originalImageResourceOption = "RESOURCES";
        scope.opusCtrl.opus = {uuid: "123456", dataResourceConfig: {recordSources: [], imageSources: ["dr1", "dr2"], imageResourceOption: "RESOURCES"}};

        scope.opusCtrl.imageResourceMultiSelectOptions = {
            selectedItems: [{name: "resource1", id: "dr1"}, {name: "resource2", id: "dr2"}],
            items: [{name: "resource3", id: "dr3"}, {name: "resource4", id: "dr4"}]
        };

        // simulate modifying the image config by selecting the ALL option
        scope.opusCtrl.opus.dataResourceConfig.imageResourceOption = "ALL";
        scope.opusCtrl.resetImageSources();
        scope.$apply();

        expect(scope.opusCtrl.opus.dataResourceConfig.imageResourceOption).toBe("RESOURCES");
        expect(scope.opusCtrl.imageResourceMultiSelectOptions.selectedItems).toEqual([{name: "resource1", id: "dr1"}, {name: "resource2", id: "dr2"}]);
    });
});

describe("AttributesController tests", function () {
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
        currentUser: function() {
            return "bob"
        },
        confirm: function() {},
        toKey: function(v) {return v},
        LAST: "last"
    };
    var form = {
        $setPristine: function () {},
        $setDirty: function () {}
    };
    var modal = {
        open: function() {}
    };
    var messageService;
    var profileService;
    var profileDefer, vocabDefer, saveAttrDefer, deleteAttrDefer, showAuditDefer, searchDefer, confirmDefer;
    var getProfileSpy;
    var window;
    var $q;

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "attributes":["attr1", "attr2"]}, "opus": {"imageSources": ["source1", "source2"], "attributeVocabUuid": "1"}}';
    var vocabResponse = '{"terms": [{"name": "term1", "order": 2}, {"name": "term2", "order": 1}]}';
    var saveAttributeResponse = '{"attributeId": "newId"}';
    var deleteAttributeResponse = '{}';
    var showAuditResponse = '{"items":[{"userId": "1", "object": {"text":"auditText1", "title":"auditTitle1"}}, {"userId": "2", "object": {"text":"auditText2", "title":"auditTitle2"}}], "total":2}';

    beforeAll(function () {
        console.log("****** Attributes Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, _$q_, _messageService_, _$window_, _$filter_) {
        $q = _$q_;
        scope = $rootScope.$new();
        profileService = _profileService_;
        window = _$window_;

        profileDefer = $q.defer();
        vocabDefer = $q.defer();
        deleteAttrDefer = $q.defer();
        saveAttrDefer = $q.defer();
        showAuditDefer = $q.defer();
        searchDefer = $q.defer();
        confirmDefer = $q.defer();

        getProfileSpy = spyOn(profileService, "getProfile").and.returnValue(profileDefer.promise);
        spyOn(profileService, "getOpusVocabulary").and.returnValue(vocabDefer.promise);
        spyOn(profileService, "saveAttribute").and.returnValue(saveAttrDefer.promise);
        spyOn(profileService, "deleteAttribute").and.returnValue(deleteAttrDefer.promise);
        spyOn(profileService, "getAuditHistory").and.returnValue(showAuditDefer.promise);
        spyOn(profileService, "profileSearch").and.returnValue(searchDefer.promise);

        spyOn(mockUtil, "confirm").and.returnValue(confirmDefer.promise);

        spyOn(form, "$setPristine");
        spyOn(form, "$setDirty");

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop","alertStayOn"]);

        controller = $controller("AttributeEditor as attrCtrl", {
            $scope: scope,
            profileService: profileService,
            util: mockUtil,
            messageService: messageService,
            $filter: _$filter_
        });
    }));

    it("should set the profile attribute of the current scope.attrCtrl when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.profile).toBeDefined();
    });

    it("should set the opus attribute of the current scope.attrCtrl when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.opus).toBeDefined();
    });

    it("should set the readonly flag to false when init is called with edit=false", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.readonly).toBe(true);
    });

    it("should set the readonly flag to false when init is called with edit=true", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("true");
        scope.$apply();

        expect(scope.attrCtrl.readonly).toBe(false);
    });

    it("should set the attributes array on the scope.attrCtrl with the results from the getProfile call", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.attributes.length).toBe(2);
    });

    it("should sort the attribute titles array by the order property of the vocabulary term", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.attributeTitles.length).toBe(2);
        // term2 has order = 1, term1 has order = 2
        expect(scope.attrCtrl.attributeTitles[0].name).toBe("term2");
        expect(scope.attrCtrl.attributeTitles[1].name).toBe("term1");
    });

    it("should set the attributeTitles array on the scope.attrCtrl with the results from the getOpusVocabulary call if the opus has attributeVocabUuid", function () {
        var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "attributes":["attr1", "attr2"]}, ' +
            '"opus": {"dataResourceConfig": {"imageResourceOption": "RESOURCES", "imageSources": ["source1", "source2"]}, "attributeVocabUuid": "1234"}}';
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.attributeTitles.length).toBe(2);
    });

    it("should leave the attributeTitles array empty if the opus has no attributeVocabUuid", function () {
        var data = JSON.parse(getProfileResponse);
        data.opus.attributeVocabUuid = null;
        profileDefer.resolve(data);
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.attributeTitles.length).toBe(0);
    });

    it("should raise an alert message when the call to getProfile fails", function () {
        profileDefer.reject();
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.profile).not.toBeDefined();
        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the profile.");
    });


    it("should add a 'loading profile data' info message when retrieving the profile, and remove it when done", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(messageService.info).toHaveBeenCalledWith("Loading profile data...");
        expect(messageService.info.calls.count()).toBe(1);
    });

    it("should create a new empty attribute object at the start of the attributes list when addAttribute is invoked", function () {
        expect(scope.attrCtrl.attributes.length).toBe(0);

        scope.attrCtrl.addAttribute(form);

        expect(scope.attrCtrl.attributes.length).toBe(1);
        expect(scope.attrCtrl.attributes[0].title).toBe("");
        expect(scope.attrCtrl.attributes[0].uuid).toBe("");
        expect(scope.attrCtrl.attributes[0].contributor.length).toBe(0);
    });

    it("should invoke the saveAttribute method of the profile service when saveAttribute is invoked", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attr Title", "text": "attrText"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "Attr Title", // titles are capitalized on save
            "text": "attrText",
            "significantEdit": false,
            numbers: undefined,
            numberRange: undefined,
            unit: undefined,
            constraintList: undefined
        });
    });

    it("should set the form to pristine after the attribute is successfully saved", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(form.$setPristine).toHaveBeenCalled();
    });

    it("should include the original attribute when saving (if present)", function() {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attr Title", "text": "attrText", original: {uuid: "uuid2"}}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "Attr Title", // titles are capitalized on save
            "text": "attrText",
            "original": {uuid: "uuid2"},
            "significantEdit": false,
            numbers: undefined,
            numberRange: undefined,
            unit: undefined,
            constraintList: undefined
        });
    });

    it("should include the creators when saving (if present)", function() {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attr Title", "text": "attrText", "creators": "creatorList"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "Attr Title", // titles are capitalized on save
            "text": "attrText",
            "creators": "creatorList",
            "significantEdit": false,
            numbers: undefined,
            numberRange: undefined,
            unit: undefined,
            constraintList: undefined
        });
    });

    it("should include the editors when saving (if present)", function() {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attr Title", "text": "attrText", "editors": "editorList"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "Attr Title", // titles are capitalized on save
            "text": "attrText",
            "editors": "editorList",
            "significantEdit": false,
            numbers: undefined,
            numberRange: undefined,
            unit: undefined,
            constraintList: undefined
        });
    });

    it("should raise an alert message if the attribute could not be saved", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        saveAttrDefer.reject();

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should display a success message when the attribute is saved", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(messageService.success).toHaveBeenCalled();
    });

    it("should update the uuid of the attribute when it is saved", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(scope.attrCtrl.attributes[0].uuid).toBe("newId");
    });

    it("should display a confirmation dialog when deleteAttribute is invoked", function () {
        scope.attrCtrl.deleteAttribute(0);
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.$apply();

        expect(mockUtil.confirm).toHaveBeenCalled();
    });

    it("should not delete the attribute if the confirmation is cancelled", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        confirmDefer.reject();
        scope.attrCtrl.deleteAttribute(0);
        scope.$apply();

        expect(mockUtil.confirm).toHaveBeenCalled();
        expect(scope.attrCtrl.attributes.length).toBe(1);
    });

    it("should not invoke profileService if the attribute has not been saved (i.e. Uuid is null)", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "", "title": "attrTitle", "text": "attrText"}];

        confirmDefer.resolve({});
        scope.attrCtrl.deleteAttribute(0);
        scope.$apply();

        expect(profileService.deleteAttribute).not.toHaveBeenCalled();
        expect(scope.attrCtrl.attributes.length).toBe(0);
    });

    it("should invoke profileService if the attribute has been saved", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        confirmDefer.resolve({});
        deleteAttrDefer.resolve(JSON.parse(deleteAttributeResponse));
        scope.attrCtrl.deleteAttribute(0);
        scope.$apply();

        expect(profileService.deleteAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1");
        expect(scope.attrCtrl.attributes.length).toBe(0);
    });

    it("should raise an alert message if the delete fails", function () {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        confirmDefer.resolve({});
        deleteAttrDefer.reject();
        scope.attrCtrl.deleteAttribute(0);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
        expect(scope.attrCtrl.attributes.length).toBe(1);
    });

    it("should set the title and text to the selected audit item when revertAttribute is invoked", function () {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{title: "originalTitle1", text: "originalText1"},
            {
                title: "originalTitle2",
                text: "originalText2",
                audit: [{object: {title: "auditTitle1", text: "auditText1"}},
                    {object: {title: "auditTitle2", text: "auditText2"}}]
            }];

        scope.attrCtrl.revertAttribute(1, 1, form);

        expect(scope.attrCtrl.attributes[1].text).toBe("auditText2");
        expect(scope.attrCtrl.attributes[1].title).toBe("auditTitle2");
        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should populate the audit, auditShowing and diff properties of the selected attribute when showAudit is invoked", function () {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{title: "originalTitle1", text: "originalText1"},
            {title: "originalTitle2", text: "originalText2"}];

        showAuditDefer.resolve(JSON.parse(showAuditResponse));
        scope.attrCtrl.showAudit(1);
        scope.$apply();

        expect(scope.attrCtrl.attributes[0].audit).not.toBeDefined();
        expect(scope.attrCtrl.attributes[1].audit).toEqual([{
            userId: "1",
            object: {text: "auditText1", title: "auditTitle1"}
        }, {userId: "2", object: {text: "auditText2", title: "auditTitle2"}}]);
    });

    it("should raise an alert message when the audit history cannot be retrieved", function () {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{title: "originalTitle1", text: "originalText1"},
            {title: "originalTitle2", text: "originalText2"}];

        showAuditDefer.reject();
        scope.attrCtrl.showAudit(1);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the audit history.");
    });

    it("should set the auditShowing property of the selected attribute to false when hideAudit is invoked", function() {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{title: "originalTitle1", text: "originalText1"},
            {title: "originalTitle2", text: "originalText2"}];

        scope.attrCtrl.hideAudit(1);

        expect(scope.attrCtrl.attributes[1].auditShowing).toBe(false);
    });

    it("should return true if the vocabulary is NOT strict when isValid is invoked with a value not in the vocab", function() {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.vocabularyStrict = false;
        scope.attrCtrl.attributeTitles = ["term1", "term2", "term3"];

        var valid = scope.attrCtrl.isValid("something else");

        expect(valid).toBe(true);
    });

    it("should return false if the vocabulary IS strict when isValid is invoked with a value not in the vocab", function() {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.vocabularyStrict = true;
        scope.attrCtrl.attributeTitles = ["term1", "term2", "term3"];

        var valid = scope.attrCtrl.isValid("something else");

        expect(valid).toBe(false);
    });

    it("should return true if the vocabulary IS strict when isValid is invoked with a value in the vocab", function() {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.vocabularyStrict = true;
        scope.attrCtrl.attributeTitles = ["term1", "term2", "term3"];

        var valid = scope.attrCtrl.isValid("term2");

        expect(valid).toBe(false);
    });

    it("should create a COPY of the specified attribute and set the original property when copyAttribute is called", function() {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        var attribute1 = {uuid: "uuid1", title: "title1"};
        var attribute2 = {uuid: "uuid2", title: "title2", fromCollection: {opusTitle: "opusTitle"}};
        var attribute3 = {uuid: "uuid3", title: "title3"};
        scope.attrCtrl.attributes = [attribute1, attribute2, attribute3];

        scope.attrCtrl.copyAttribute(1, form);

        expect(scope.attrCtrl.attributes.length).toBe(3);
        expect(scope.attrCtrl.attributes[1].uuid).toBe("");
        expect(scope.attrCtrl.attributes[1].original).toBe(attribute2);
        expect(scope.attrCtrl.attributes[1].source).toBe("opusTitle");
    });

    it("should not include the current opus in the search when loadAttributesFromSupportingCollections is called", function() {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.profile = {scientificName: "profile1"};
        scope.attrCtrl.opus = {supportingOpuses: [{uuid: "support1"}, {uuid: "support2"}]};

        scope.attrCtrl.loadAttributesFromSupportingCollections();

        expect(profileService.profileSearch).toHaveBeenCalledWith("support1,support2", "profile1", false);
    });

    it("should do nothing if the call to profileSearch fails when loadAttributesFromSupportingCollections is called", function() {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        searchDefer.reject();

        scope.attrCtrl.profile = {scientificName: "profile1"};
        scope.attrCtrl.opus = {supportingOpuses: [{uuid: "support1"}, {uuid: "support2"}]};

        scope.attrCtrl.loadAttributesFromSupportingCollections();
        scope.$apply();

        expect(profileService.profileSearch).toHaveBeenCalledWith("support1,support2", "profile1", false);
        expect(profileService.getProfile).not.toHaveBeenCalled();
    });

    it("should call add each attribute that does not exist to the list when loadAttributesFromSupportingCollections is called", function() {
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        var attribute1 = {uuid: "uuid1", title: "title1"};
        var attribute2 = {uuid: "uuid2", title: "title2"};
        var attribute3 = {uuid: "uuid3", title: "title3"};

        var searchResult = [{profileId: "profile2", opus: {uuid: "support1", title: "supporting opus 1"}}];
            //{profileId: "profile3", opus: {uuid: "support2", title: "supporting opus 2"}}];
        searchDefer.resolve(searchResult);

        var profile2 = {profile: {uuid: "profile2", attributes: [attribute1, attribute3]}, opus: {uuid: "support1", title: "supporting opus 1"}};

        profileDefer.resolve(profile2);

        scope.attrCtrl.profile = {scientificName: "profile1"};
        scope.attrCtrl.opus = {supportingOpuses: [{uuid: "support1"}, {uuid: "support2"}]};
        scope.attrCtrl.attributes = [attribute1, attribute2];

        scope.attrCtrl.loadAttributesFromSupportingCollections();
        scope.$apply();

        expect(profileService.getProfile).toHaveBeenCalledWith("support1", "profile2");
        expect(scope.attrCtrl.attributes.length).toBe(3);
        expect(scope.attrCtrl.attributes[0].title).toBe("title1");
        expect(scope.attrCtrl.attributes[1].title).toBe("title2");
        expect(scope.attrCtrl.attributes[2].title).toBe("title3");
    });

    it("should add the title of all supporting attributes to the attributeTitle list, but not the approvedVocabulary list, when loadAttributesFromSupportingCollections is called", function() {
        scope.attrCtrl.approvedVocabulary = ["title1", "title2"];
        scope.attrCtrl.attributeTitles = [{name: "title1"}, {name: "title2"}];

        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        var attribute1 = {uuid: "uuid1", title: "title1"};
        var attribute2 = {uuid: "uuid2", title: "title2"};
        var attribute3 = {uuid: "uuid3", title: "title3"};

        var searchResult = [{profileId: "profile2", opus: {uuid: "support1", title: "supporting opus 1"}}];

        searchDefer.resolve(searchResult);

        var profile2 = {profile: {uuid: "profile2", attributes: [attribute1, attribute3]}, opus: {uuid: "support1", title: "supporting opus 1"}};

        profileDefer.resolve(profile2);

        scope.attrCtrl.profile = {scientificName: "profile1"};
        scope.attrCtrl.opus = {supportingOpuses: [{uuid: "support1"}, {uuid: "support2"}]};
        scope.attrCtrl.attributes = [attribute1, attribute2];

        scope.attrCtrl.loadAttributesFromSupportingCollections();
        scope.$apply();

        expect(scope.attrCtrl.attributeTitles).toEqual([{name: "title1"}, {name: "title2"}, {name: "title3"}]);
        expect(scope.attrCtrl.approvedVocabulary).toEqual(["title1", "title2"]);
    });

    it("should not pre-populate the attributes list with required attributes from the vocabulary on initialisation in readonly mode", function() {
        var vocab = {terms: [{name: "mandatory1", required: true}, {name: "optional1", required: false}, {name: "mandatory2", required: true}]};

        profileDefer.resolve({profile: {attributes: []}, opus: {attributeVocabUuid: "1234", supportingOpuses: []}});
        vocabDefer.resolve(vocab);
        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.attributes.length).toBe(0);
    });

    it("should pre-populate the attributes list with any required attributes from the vocabulary on initialisation in edit mode", function() {
        var vocab = {terms: [{name: "mandatory1", required: true}, {name: "optional1", required: false}, {name: "mandatory2", required: true}]};

        profileDefer.resolve({profile: {attributes: []}, opus: {attributeVocabUuid: "1234", supportingOpuses: []}});
        vocabDefer.resolve(vocab);
        scope.attrCtrl.init("true");
        scope.$apply();

        expect(scope.attrCtrl.attributes.length).toBe(2);
        expect(scope.attrCtrl.attributes[0].title).toBe("mandatory1");
        expect(scope.attrCtrl.attributes[1].title).toBe("mandatory2");
    });

    it("should not add a template attribute if an attribute with that term already exists", function() {
        var vocab = {terms: [{name: "mandatory1", required: true}, {name: "optional1", required: false}, {name: "mandatory2", required: true}]};

        profileDefer.resolve({profile: {attributes: [{title: "mandatory1"}]}, opus: {attributeVocabUuid: "1234", supportingOpuses: []}});
        vocabDefer.resolve(vocab);
        scope.attrCtrl.init("true");
        scope.$apply();

        // should not add a 3rd attribute since mandatory1 already exists
        expect(scope.attrCtrl.attributes.length).toBe(2);
        expect(scope.attrCtrl.attributes[0].title).toBe("mandatory1");
        expect(scope.attrCtrl.attributes[1].title).toBe("mandatory2");
    });

    it("should add a template attribute even if an attribute from a supporting collection already exists with that term", function() {
        var vocab = {terms: [{name: "mandatory1", required: true}, {name: "optional1", required: false}, {name: "mandatory2", required: true}]};

        var profile1 = {profile: {attributes: []}, opus: {attributeVocabUuid: "1234", supportingOpuses: [{uuid: "support2"}]}};
        var profile2 = {profile: {uuid: "profileId2", attributes: [{title: "mandatory2", fromCollection: {opusId: "abc"}}]}, opus: {uuid: "support1", title: "supporting opus 1"}};

        var profile2Defer = $q.defer();
        getProfileSpy.and.callFake(function(opusId, profileId) {
            if (profileId === "profileId1") {
                return profileDefer.promise;
            } else {
                return profile2Defer.promise;
            }
        });

        var searchResult = [{profileId: "profileId2", opus: {uuid: "support1", title: "supporting opus 1"}}];

        searchDefer.resolve(searchResult);

        profileDefer.resolve(profile1);
        profile2Defer.resolve(profile2);
        vocabDefer.resolve(vocab);

        scope.attrCtrl.init("true");

        scope.$apply();

        // should add a 3rd attribute because even though mandatory2 exists in the attributes list, it is from a supporting collection
        expect(scope.attrCtrl.attributes.length).toBe(3);
        expect(scope.attrCtrl.attributes[0].title).toBe("mandatory1");
        expect(scope.attrCtrl.attributes[1].title).toBe("mandatory2");
        expect(scope.attrCtrl.attributes[2].title).toBe("mandatory2");
    });

    it("should not add the title of a supporting attribute to the attributeTitle list if it already exists in the list", function() {
        var vocab = {terms: [{name: "title1"}, {name: "title2"}, {name: "title3"}]};

        var profile1 = {profile: {attributes: [{title: "title1"}]}, opus: {attributeVocabUuid: "1234", supportingOpuses: [{uuid: "support2"}]}};
        var profile2 = {profile: {uuid: "profileId2", attributes: [{title: "title2", fromCollection: {opusId: "abc"}}]}, opus: {uuid: "title3", title: "supporting opus 1"}};

        var profile2Defer = $q.defer();
        getProfileSpy.and.callFake(function(opusId, profileId) {
            if (profileId === "profileId1") {
                return profileDefer.promise;
            } else {
                return profile2Defer.promise;
            }
        });

        var searchResult = [{profileId: "profileId2", opus: {uuid: "support1", title: "supporting opus 1"}}];

        searchDefer.resolve(searchResult);

        profileDefer.resolve(profile1);
        profile2Defer.resolve(profile2);
        vocabDefer.resolve(vocab);

        scope.attrCtrl.init("true");

        scope.$apply();

        // should add a 3rd attribute because even though mandatory2 exists in the attributes list, it is from a supporting collection
        expect(scope.attrCtrl.attributeTitles.length).toBe(3);
    });


    it("should not add the title of a supporting attribute to the attributeTitle list if it already exists in the list - case insensitive", function() {
        var vocab = {terms: [{name: "title1"}, {name: "TITLE2"}, {name: "title3"}]};

        var profile1 = {profile: {attributes: [{title: "title1"}]}, opus: {attributeVocabUuid: "1234", supportingOpuses: [{uuid: "support2"}]}};
        var profile2 = {profile: {uuid: "profileId2", attributes: [{title: "title2", fromCollection: {opusId: "abc"}}]}, opus: {uuid: "title3", title: "supporting opus 1"}};

        var profile2Defer = $q.defer();
        getProfileSpy.and.callFake(function(opusId, profileId) {
            if (profileId === "profileId1") {
                return profileDefer.promise;
            } else {
                return profile2Defer.promise;
            }
        });

        var searchResult = [{profileId: "profileId2", opus: {uuid: "support1", title: "supporting opus 1"}}];

        searchDefer.resolve(searchResult);

        profileDefer.resolve(profile1);
        profile2Defer.resolve(profile2);
        vocabDefer.resolve(vocab);

        scope.attrCtrl.init("true");

        scope.$apply();

        // should add a 3rd attribute because even though mandatory2 exists in the attributes list, it is from a supporting collection
        expect(scope.attrCtrl.attributeTitles.length).toBe(3);
    });

    describe("compareTitles", function() {
        it("should consider group by order when sorting", function() {
            var array = [{ groupBy: { order: 1 }, order: 1 }, { groupBy: { order: 2 }, order: 2 }];
            var expected = [{ groupBy: { order: 1 }, order: 1 }, { groupBy: { order: 2 }, order: 2 }];
            expect(array.sort(scope.attrCtrl.compareTitles)).toEqual(expected);

            array = [{ groupBy: { order: 2 }, order: 2 }, { groupBy: { order: 1 }, order: 1 }];
            expected = [{ groupBy: { order: 1 }, order: 1 }, { groupBy: { order: 2 }, order: 2 }];
            expect(array.sort(scope.attrCtrl.compareTitles)).toEqual(expected);


            array = [{ name: "a" , order: 4}, { order: 3 },{ groupBy: { order: 2 }, order: 2 }, { groupBy: { order: 1 }, order: 1 }];
            expected = [{ groupBy: { order: 1 }, order: 1 }, { groupBy: { order: 2 }, order: 2 }, {order: 3}, {name: 'a', order: 4}];
            console.log(array.sort(scope.attrCtrl.compareTitles))
            expect(array.sort(scope.attrCtrl.compareTitles)).toEqual(expected);
        });

        it("should consider order when sorting if group by is not present", function() {
            var array = [{ order: 1 }, { order: 2 }];
            var expected = [{ order: 1 }, { order: 2 }];
            expect(array.sort(scope.attrCtrl.compareTitles)).toEqual(expected);

            var array = [{ order: 2 }, { order: 1 }];
            var expected = [{ order: 1 }, { order: 2 }];
            expect(array.sort(scope.attrCtrl.compareTitles)).toEqual(expected);
        });

    });

    describe("isNumberRangeValid", function() {
        var attribute, form;

        beforeEach(function() {
            attribute = {};
            form = {
                $setValidity: function(key, value) {}
            };
            spyOn(form, '$setValidity');
        });

        it("should set form validity to true if number range is valid", function() {
            attribute.numberRange = {from: 10, to: 20};
            attribute.dataType = 'range';

            scope.attrCtrl.isNumberRangeValid(attribute, form);

            expect(form.$setValidity).toHaveBeenCalledWith('fromgreaterthanto', true);
        });

        it("should set form validity to false if from is greater than to", function() {
            attribute.numberRange = {from: 20, to: 10};
            attribute.dataType = 'range';

            scope.attrCtrl.isNumberRangeValid(attribute, form);

            expect(form.$setValidity).toHaveBeenCalledWith('fromgreaterthanto', false);
        });

        it("should not set form validity if dataType is not range", function() {
            attribute.numberRange = {from: 20, to: 10};
            attribute.dataType = 'other';

            scope.attrCtrl.isNumberRangeValid(attribute, form);

            expect(form.$setValidity).not.toHaveBeenCalled();
        });

        it("should not set form validity if numberRange is not defined", function() {
            attribute.dataType = 'range';

            scope.attrCtrl.isNumberRangeValid(attribute, form);

            expect(form.$setValidity).not.toHaveBeenCalled();
        });
    });

    describe("getSetConstraintList", function() {
        var attribute, label;

        beforeEach(function() {
            attribute = {
                dataType: "singleselect",
                constraintList: []
            };
            label = {
                termId: "term1"
            };
        });

        it("should return value of model for single select data type", function() {
            var constraint = scope.attrCtrl.getSetConstraintList(attribute, label)();
            expect(constraint).toBeUndefined();
            attribute.constraintList = ['term2'];
            constraint = scope.attrCtrl.getSetConstraintList(attribute, label)();
            expect(constraint).toEqual('term2');
        });

        it("should add term to single select list", function() {
            attribute.constraintList = [];
            var fn = scope.attrCtrl.getSetConstraintList(attribute, label);
            fn('selected');
            expect(attribute.constraintList.length).toEqual(1);
            expect(attribute.constraintList[0]).toEqual(label.termId);

            // selection should remain the same
            fn('selected');
            expect(attribute.constraintList.length).toEqual(1);
            expect(attribute.constraintList[0]).toEqual(label.termId);
        });

        it("should return undefined when no constraint is set for list data type", function() {
            attribute.dataType = "list";
            attribute.constraintList = [];
            var constraint = scope.attrCtrl.getSetConstraintList(attribute, label)();
            expect(constraint).toBeUndefined();

            attribute.constraintList = ['term1', 'term2'];
            var constraint = scope.attrCtrl.getSetConstraintList(attribute, label)();
            expect(constraint).toEqual('term1');
        });

        it("should add constraint for list attribute", function() {
            attribute.dataType = "list";
            attribute.constraintList = [];
            scope.attrCtrl.getSetConstraintList(attribute, label)('clicked');
            expect(attribute.constraintList).toEqual(["term1"]);

            attribute.dataType = "list";
            attribute.constraintList = ["term1"];
            scope.attrCtrl.getSetConstraintList(attribute, label)('clicked');
            expect(attribute.constraintList).toEqual([]);
        });
    });

    describe('findAttributesByTitle', function() {
        it('should return attributes with the given title', function() {
            scope.attrCtrl.attributes = [{ title: 'attribute1', value: 'value1' }, { title: 'attribute2', value: 'value2' }, { title: 'attribute1', value: 'value3' }];
            var title = 'attribute1';

            var result = scope.attrCtrl.findAttributesByTitle(title);
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual({ title: 'attribute1', value: 'value1' });
            expect(result[1]).toEqual({ title: 'attribute1', value: 'value3' });
        });
    });

    describe('findAttributeVocabByTitle', function() {
        beforeEach(function() {
            scope.attrCtrl.attributeVocabTerms = [{name: 'title1', termId: '1'}, {name: 'title2', termId: '2'}, {name: 'title3', termId: '3'}];
        });

        it('should return the vocab term with the matching title', function() {
            var title = 'title2';
            var expectedVocabTerm = {name: 'title2', termId: '2'};

            var result = scope.attrCtrl.findAttributeVocabByTitle(title);

            expect(result).toEqual(expectedVocabTerm);
        });

        it('should return null if no matching title is found', function() {
            var title = 'non-existent title';

            var result = scope.attrCtrl.findAttributeVocabByTitle(title);

            expect(result).toBe(null);
        });
    });

    describe("getGroupAttributes", function() {

        beforeEach(function() {
            scope.attrCtrl.showAttribute = function(attribute) { return true; };
            scope.attrCtrl.attributes = [
                { uuid: "1", title: "Attribute 1", groupBy: { uuid: "g1" }},
                { uuid: "2", title: "attribute 2", groupBy: { uuid: "g1" }},
                { uuid: "3", title: "attribute 3", groupBy: { uuid: "g2" }},
                { uuid: "4", title: "attribute 4", groupBy: { uuid: "g2" }},
                { uuid: "5", title: "attribute 5" }
            ];
        });

        it("should return an array of attributes that belong to the same group", function() {
            var result = scope.attrCtrl.getGroupAttributes({ uuid: "2", title: "attribute 2", groupBy: { uuid: "g1" }});
            expect(result).toEqual([
                { uuid: "1", title: "Attribute 1", groupBy: { uuid: "g1" } },
                { uuid: "2", title: "attribute 2", groupBy: { uuid: "g1" } }
            ]);
        });

        it("should return undefined if the input attribute doesn't belong to any group", function() {
            var result = scope.attrCtrl.getGroupAttributes({ uuid: "5", title: "attribute 5" });
            expect(result).toEqual(undefined);
        });
    });

    describe("isFirstAttributeInGroup", function() {
        beforeEach(function () {
            // mock self.attributes
            scope.attrCtrl.attributes = [
                {title: "Title 1", groupBy: {uuid: "123"}},
                {title: "Title 2", groupBy: {uuid: "123"}},
                {title: "Title 3", groupBy: {uuid: "456"}},
                {title: "Title 4", groupBy: null}
            ];
            // mock self.showTitleGroup to always return true
            scope.attrCtrl.showTitleGroup = function () {
                return true;
            }
            // mock self.showAttribute to always return true
            scope.attrCtrl.showAttribute = function () {
                return true;
            }
        });

        it("should return true if the attribute is the first in its group", function () {
            expect(scope.attrCtrl.isFirstAttributeInGroup("Title 1")).toBe(true);
            expect(scope.attrCtrl.isFirstAttributeInGroup("Title 3")).toBe(true);
        });

        it("should return false if the attribute is not the first in its group", function () {
            expect(scope.attrCtrl.isFirstAttributeInGroup("Title 2")).toBe(false);
        });
    });


    describe("isLastAttributeInGroup", function() {
        beforeEach(function () {
            // mock self.attributes
            scope.attrCtrl.attributes = [
                {title: "Title 1", groupBy: {uuid: "123"}},
                {title: "Title 2", groupBy: {uuid: "123"}},
                {title: "Title 3", groupBy: {uuid: "456"}},
                {title: "Title 4", groupBy: null}
            ];
            // mock self.showTitleGroup to always return true
            scope.attrCtrl.showTitleGroup = function () {
                return true;
            }
            // mock self.showAttribute to always return true
            scope.attrCtrl.showAttribute = function () {
                return true;
            }
        });

        it("should return true if the attribute is the last in its group", function () {
            expect(scope.attrCtrl.isLastAttributeInGroup("Title 2")).toBe(true);
            expect(scope.attrCtrl.isLastAttributeInGroup("Title 3")).toBe(true);
        });

        it("should return false if the attribute is not the last in its group", function () {
            expect(scope.attrCtrl.isLastAttributeInGroup("Title 1")).toBe(false);
        });
    });

    describe('hasContent', function() {
        var attribute;

        beforeEach(function() {
            attribute = {};
        });

        it('should return false for a number data type with no numbers', function() {
            attribute.dataType = 'number';
            attribute.numbers = null;
            expect(scope.attrCtrl.hasContent(attribute)).toBe(false);
        });

        it('should return true for a number data type with numbers', function() {
            attribute.dataType = 'number';
            attribute.numbers = [1, 2, 3];
            expect(scope.attrCtrl.hasContent(attribute)).toBe(true);
        });

        it('should return false for a range data type with no range', function() {
            attribute.dataType = 'range';
            attribute.numberRange = {};
            expect(scope.attrCtrl.hasContent(attribute)).toBe(false);
        });

        it('should return true for a range data type with a range', function() {
            attribute.dataType = 'range';
            attribute.numberRange = { from: 1, to: 10 };
            expect(scope.attrCtrl.hasContent(attribute)).toBe(true);
        });

        it('should return false for a singleselect data type with no constraintList', function() {
            attribute.dataType = 'singleselect';
            attribute.constraintList = null;
            expect(scope.attrCtrl.hasContent(attribute)).toBe(false);
        });

        it('should return true for a singleselect data type with a constraintList', function() {
            attribute.dataType = 'singleselect';
            attribute.constraintList = [1];
            expect(scope.attrCtrl.hasContent(attribute)).toBe(true);
        });

        it('should return false for a list data type with no constraintList', function() {
            attribute.dataType = 'list';
            attribute.constraintList = null;
            expect(scope.attrCtrl.hasContent(attribute)).toBe(false);
        });

        it('should return true for a list data type with a constraintList', function() {
            attribute.dataType = 'list';
            attribute.constraintList = [1];
            expect(scope.attrCtrl.hasContent(attribute)).toBe(true);
        });

        it('should return false for a text data type with no text', function() {
            attribute.dataType = 'text';
            attribute.text = null;
            expect(scope.attrCtrl.hasContent(attribute)).toBe(false);
        });

        it('should return true for a text data type with text', function() {
            attribute.dataType = 'text';
            attribute.text = 'Some Text';
            expect(scope.attrCtrl.hasContent(attribute)).toBe(true);
        });
    });

    describe("getContent", function() {

        var attribute;

        beforeEach(function() {
            attribute = {};
        });

        it("should return numbers for 'number' dataType", function() {
            attribute.dataType = 'number';
            attribute.numbers = [1,2,3];
            expect(scope.attrCtrl.getContent(attribute)).toEqual([1,2,3]);
        });

        it("should return number range for 'range' dataType", function() {
            attribute.dataType = 'range';
            attribute.numberRange = {from: 1, to: 2};
            expect(scope.attrCtrl.getContent(attribute)).toEqual({from: 1, to: 2});
        });

        it("should return a string of comma separated names for 'singleselect' and 'list' dataType", function() {
            attribute.dataType = 'singleselect';
            attribute.constraintListExpanded = [{name: 'Option 1', uuid: 1}, {name: 'Option 2', uuid: 2}];
            attribute.constraintList = [1, 2];
            expect(scope.attrCtrl.getContent(attribute)).toEqual("Option 1, Option 2");
        });

        it("should return the value of 'text' for any other dataType", function() {
            attribute.dataType = 'text';
            attribute.text = "Sample Text";
            expect(scope.attrCtrl.getContent(attribute)).toEqual("Sample Text");
        });

    });

    describe('removeNumber', function() {
        var attribute, form;

        beforeEach(function() {
            attribute = { numbers: [1, 2, 3] };
            form = jasmine.createSpyObj('form', ['$setDirty']);
        });

        it('should remove the number at the specified index', function() {
            scope.attrCtrl.removeNumber(attribute, form, 1);
            expect(attribute.numbers).toEqual([1, 3]);
            expect(form.$setDirty).toHaveBeenCalled();
        });

        it('should do nothing if attribute has no numbers', function() {
            attribute.numbers = null;
            scope.attrCtrl.removeNumber(attribute, form, 1);
            expect(attribute.numbers).toBeNull();
            expect(form.$setDirty).not.toHaveBeenCalled();
        });
    });
});
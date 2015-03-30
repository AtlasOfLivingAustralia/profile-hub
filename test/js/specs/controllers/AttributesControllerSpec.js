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
        confirm: function() {},
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

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "attributes":["attr1", "attr2"]}, "opus": {"imageSources": ["source1", "source2"]}}';
    var vocabResponse = '{"terms": ["term1", "term2"]}';
    var saveAttributeResponse = '{"attributeId": "newId"}';
    var deleteAttributeResponse = '{}';
    var showAuditResponse = '[{"userId": "1", "object": {"text":"auditText1", "title":"auditTitle1"}}, {"userId": "2", "object": {"text":"auditText2", "title":"auditTitle2"}}]';

    beforeAll(function () {
        console.log("****** Attributes Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_, _$window_, _$filter_) {
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
        spyOn(profileService, "getAuditForAttribute").and.returnValue(showAuditDefer.promise);
        spyOn(profileService, "profileSearch").and.returnValue(searchDefer.promise);

        spyOn(mockUtil, "confirm").and.returnValue(confirmDefer.promise);

        spyOn(form, "$setPristine");
        spyOn(form, "$setDirty");

        messageService = jasmine.createSpyObj(_messageService_, ["success", "info", "alert", "pop"]);

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

    it("should set the attributeTitles array on the scope.attrCtrl with the results from the getOpusVocabulary call if the opus has attributeVocabUuid", function () {
        var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "attributes":["attr1", "attr2"]}, ' +
            '"opus": {"imageSources": ["source1", "source2"], "attributeVocabUuid": "1234"}}';
        profileDefer.resolve(JSON.parse(getProfileResponse));
        vocabDefer.resolve(JSON.parse(vocabResponse));

        scope.attrCtrl.init("false");
        scope.$apply();

        expect(scope.attrCtrl.attributeTitles.length).toBe(2);
    });

    it("should leave the attributeTitles array empty if the opus has attributeVocabUuid", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));
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
        expect(messageService.pop).toHaveBeenCalledWith();
        expect(messageService.pop.calls.count()).toBe(1);
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
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "AttrTitle", // titles are capitalized on save
            "text": "attrText",
            "significantEdit": false
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
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText", original: {uuid: "uuid2"}}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "AttrTitle", // titles are capitalized on save
            "text": "attrText",
            "original": {uuid: "uuid2"},
            "significantEdit": false
        });
    });

    it("should include the creators when saving (if present)", function() {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText", "creators": "creatorList"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "AttrTitle", // titles are capitalized on save
            "text": "attrText",
            "creators": "creatorList",
            "significantEdit": false
        });
    });

    it("should include the editors when saving (if present)", function() {
        scope.attrCtrl.profile = {"uuid": "profileId1"};
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        scope.attrCtrl.attributes = [{"saving": "false", "uuid": "uuid1", "title": "attrTitle", "text": "attrText", "editors": "editorList"}];

        saveAttrDefer.resolve(JSON.parse(saveAttributeResponse));

        scope.attrCtrl.saveAttribute(0, form);
        scope.$apply();

        expect(profileService.saveAttribute).toHaveBeenCalledWith("opusId1", "profileId1", "uuid1", {
            "profileId": "profileId1",
            "uuid": "uuid1",
            "title": "AttrTitle", // titles are capitalized on save
            "text": "attrText",
            "editors": "editorList",
            "significantEdit": false
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

    it("should populate the audit and auditShowing properties of the selected attribute when showAudit is invoked", function () {
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
        scope.attrCtrl.profileId = "profileId1";
        scope.attrCtrl.opusId = "opusId1";
        var attribute1 = {uuid: "uuid1", title: "title1"};
        var attribute2 = {uuid: "uuid2", title: "title2"};
        var attribute3 = {uuid: "uuid3", title: "title3"};
        scope.attrCtrl.attributes = [attribute1, attribute2, attribute3];

        scope.attrCtrl.copyAttribute(1, form);

        expect(scope.attrCtrl.attributes.length).toBe(3);
        expect(scope.attrCtrl.attributes[1].uuid).toBe("");
        expect(scope.attrCtrl.attributes[1].original).toBe(attribute2);
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

});
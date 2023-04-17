describe('Directive: VocabularyEditor', function () {
    var scope, compile;
    var validTemplate = '<vocabulary-editor vocab-id="opusCtrl.opus.attributeVocabUuid" vocab-name="Attribute vocabulary" allow-reordering="true"></vocabulary-editor>';
    var modal;

    var mockPopup = {
        result: {
            then: function() {

            }
        }
    };

    var form;
    var messageService;
    var util;
    var http;
    var profileService;
    var findUsagesDefer, replaceUsagesDefer, updateVocabDefer, getVocabDefer, mockPopupDefer, createVocabDefer;

    var getVocabResponse = '{"name":"vocab name", "strict":"true","terms":[{"name":"term1", "termId":"term1"},{"name":"term2", "termId":"term2"},{"name":"term3", "termId":"term3"}]}';

    beforeAll(function () {
        console.log("****** VocabularyEditor Directive Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        // Load the directive's module
        module('profileEditor');

        // Inject in angular constructs otherwise, you would need to inject these into each test
        inject(function ($compile, $rootScope, _profileService_, _messageService_, $q, _$modal_, _util_, _$httpBackend_) {
            var testScope = $rootScope.$new();
            compile = $compile;

            util = _util_;
            profileService = _profileService_;
            modal = _$modal_;

            replaceUsagesDefer = $q.defer();
            findUsagesDefer = $q.defer();
            updateVocabDefer = $q.defer();
            createVocabDefer = $q.defer();
            getVocabDefer = $q.defer();
            mockPopupDefer = $q.defer();
            mockPopup.result = mockPopupDefer.promise;

            spyOn(profileService, "getOpusVocabulary").and.returnValue(getVocabDefer.promise);
            spyOn(profileService, "updateVocabulary").and.returnValue(updateVocabDefer.promise);
            spyOn(profileService, "createVocabulary").and.returnValue(createVocabDefer.promise);
            spyOn(profileService, "findUsagesOfVocabTerm").and.returnValue(findUsagesDefer.promise);
            spyOn(profileService, "replaceUsagesOfVocabTerm").and.returnValue(replaceUsagesDefer.promise);

            spyOn(util, "getEntityId").and.returnValue("opusId1");

            spyOn(modal, "open").and.returnValue(mockPopup);

            messageService = _messageService_;
            spyOn(messageService, "alert").and.stub();
            spyOn(messageService, "success").and.stub();
            spyOn(messageService, "info").and.stub();

            http = _$httpBackend_;

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

            var element = angular.element(validTemplate);
            $compile(element)(testScope);
            testScope.$digest();
            scope = element.isolateScope();
        });

        // make sure the $watch function in the link is triggered before each test
        scope.vocabId = "12345";
        scope.$digest();
    });

    it("should set the opusId attribute of the current scope when the controller is loaded", function () {
        expect(util.getEntityId).toHaveBeenCalledWith("opus");
        expect(scope.opusId).toBe("opusId1");
    });

    it("should set the vocabulary on the scope when the controller loads", function () {
        getVocabDefer.resolve(JSON.parse(getVocabResponse));
        scope.$apply();

        expect(scope.vocabulary).toBeDefined();
        expect(scope.vocabulary).not.toBeNull();
        expect(profileService.getOpusVocabulary).toHaveBeenCalled();
    });

    it("should raise an alert message when the call to getOpusVocabulary fails", function () {
        getVocabDefer.reject();

        scope.$apply();
        scope.loadVocabulary("12345", form);

        expect(profileService.getOpusVocabulary).toHaveBeenCalled();
        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while loading the vocabulary.");
    });

    it("should create a new term record on the vocabulary when addVocabTerm is invoked", function () {
        scope.opus = {attributeVocabUuid: "vocabId"};
        scope.vocabulary = {terms: []};
        scope.newVocabTerm = "NEW";
        scope.addVocabTerm(form);

        expect(scope.vocabulary.terms.length).toBe(1);
        expect(scope.vocabulary.terms[0].termId).toBe("");
        expect(scope.vocabulary.terms[0].name).toBe("New");
    });

    it("should capitalise the first letter of each word of the new term record on the vocabulary when addVocabTerm is invoked", function () {
        scope.opus = {attributeVocabUuid: "vocabId"};
        scope.vocabulary = {terms: []};
        scope.newVocabTerm = "should be capitalised";
        scope.addVocabTerm(form);

        expect(scope.vocabulary.terms[0].name).toBe("Should Be Capitalised");
    });

    it("should set the form to dirty when addVocabTerm is invoked", function () {
        scope.opus = {attributeVocabUuid: "vocabId"};
        scope.vocabulary = {terms: []};
        scope.newVocabTerm = "should be capitalised";
        scope.addVocabTerm(form);

        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should return true if the provided term is in the list of terms to be replaced when termisInReplacementList is invoked", function() {
        scope.replacements = [{vocabId: "vocab1", existingTermName: "old term", newTermName: "new term"}];
        var match = scope.termIsInReplacementList({vocabId: "vocab1", name: "old term"});

        expect(match).toBe(true);
    });

    it("should return false if the provided term is not in the list of terms to be replaced when termisInReplacementList is invoked", function() {
        scope.replacements = [{vocabId: "vocab1", existingTermId: "1", newTermName: "new term"}];
        var match = scope.termIsInReplacementList({vocabId: "vocab1", name: "something else"});

        expect(match).toBe(false);
    });

    it("should return false if the list of terms to be replaced is empty when termisInReplacementList is invoked", function() {
        scope.replacements = [];
        var match = scope.termIsInReplacementList({vocabId: "vocab1", name: "old term"});

        expect(match).toBe(false);
    });

    it("should remove the term from the vocabulary's list of terms if there are 0 usages, and set the form to dirty", function() {
        findUsagesDefer.resolve(JSON.parse('{"usageCount": 0}'));

        scope.vocabulary = {terms: [{name:"term1", termId:"term1"},{name:"term2", termId:"term2"},{name:"term3", termId:"term3"}]};

        scope.removeVocabTerm(1, form);
        scope.$apply();

        expect(profileService.findUsagesOfVocabTerm).toHaveBeenCalledWith("opusId1", "12345", "term2");
        expect(scope.vocabulary.terms.length).toBe(2);
        expect(scope.vocabulary.terms[0].name).toBe("term1");
        expect(scope.vocabulary.terms[1].name).toBe("term3");
        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should display the modal remove term popup if there are more than 0 usages when removeVocabTerm is invoked", function() {
        findUsagesDefer.resolve(JSON.parse('{"usageCount": 2}'));

        scope.vocabulary = {terms: [{name:"term1", termId:"term1"},{name:"term2", termId:"term2"},{name:"term3", termId:"term3"}]};

        scope.removeVocabTerm(1, form);
        scope.$apply();

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/removeTermPopup.htm"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controller: "RemoveTermController"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controllerAs: "removeTermCtrl"}));
    });

    it("should display the modal edit term popup when editVocabTerm is invoked", function() {
        scope.editVocabTerm(1, form);

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/editTermPopup.htm"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controller: "VocabModalController"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controllerAs: "vocabModalCtrl"}));
    });

    it("should invoke the updateVocabulary service method, then reload the vocabulary when saveVocabulary is invoked", function() {
        updateVocabDefer.resolve({});

        var vocab = {terms: [{name:"term1", termId:"term1"},{name:"term2", termId:"term2"},{name:"term3", termId:"term3"}]};

        scope.opus = {attributeVocabUuid: "vocabId"};
        scope.vocabulary = vocab;

        scope.saveVocabulary(form);
        scope.$apply();

        expect(profileService.updateVocabulary).toHaveBeenCalledWith("opusId1", "12345", vocab);
        expect(profileService.getOpusVocabulary).toHaveBeenCalledWith("opusId1", "12345");
    });

    it("should raise an alert message if the call to updateVocabulary fails", function() {
        updateVocabDefer.reject();

        scope.opus = {attributeVocabUuid: "vocabId"};
        scope.vocabulary = {terms: [{name:"term1", termId:"term1"},{name:"term2", termId:"term2"},{name:"term3", termId:"term3"}]};

        scope.saveVocabulary(form);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while updating the vocabulary.");
    });

    it("should invoke the replaceUsagesOfVocabTerm service method if there are replacements when saveVocabulary is invoked",function() {
        updateVocabDefer.resolve({});
        replaceUsagesDefer.resolve(JSON.parse('{"usages":{"Test":1}}'));

        var vocab = {terms: [{name:"term1", termId:"term1"},{name:"term2", termId:"term2"},{name:"term3", termId:"term3"}]};
        var replacements = [{vocabId: "vocab1", existingTermName: "old term", newTermName: "new term"}];

        scope.opus = {attributeVocabUuid: "vocabId"};
        scope.replacements = replacements;
        scope.vocabulary = vocab;

        scope.saveVocabulary(form);
        scope.$apply();

        expect(profileService.replaceUsagesOfVocabTerm).toHaveBeenCalledWith("opusId1", "12345", replacements);
    });

    it('should open a modal window with the correct template URL', function() {
        scope.showConstraintListVocab({ constraintListVocab: '123' }, form);

        expect(modal.open).toHaveBeenCalledWith({
            templateUrl: '/profileEditor/addVocabularyPopup.htm',
            controller: 'AddVocabularyPopupController',
            controllerAs: 'addVocabularyPopupCtrl',
            size: 'md',
            resolve: {
                vocabId: jasmine.any(Function)
            }
        });
    });

    it('should call form.$setDirty() and set new vocab id when the modal is closed', function() {
        var term = { constraintListVocab: '123' }
        scope.showConstraintListVocab(term, form);
        mockPopupDefer.resolve({ vocabId: '456' });
        scope.$apply();

        expect(term.constraintListVocab).toEqual('456');
        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should save vocabulary if vocabId is not present", function (){
        createVocabDefer.resolve({});

        var vocab = {terms: [{name:"term1", termId:"term1"},{name:"term2", termId:"term2"},{name:"term3", termId:"term3"}]};

        scope.opusId = "opus1";
        scope.vocabId = undefined;
        scope.vocabulary = vocab;

        scope.saveVocabulary(form);
        scope.$apply();

        expect(profileService.createVocabulary).toHaveBeenCalledWith("opus1", vocab);
    });

    it("should load group vocabulary", function (){
        var vocab = {terms: [{name:"term1", termId:"term1"},{name:"term2", termId:"term2"},{name:"term3", termId:"term3"}]};
        getVocabDefer.resolve({
            terms: vocab
        });

        scope.opusId = "opus1";
        scope.groupVocabId = 'vocab1';

        scope.loadGroupVocabulary(form);

        expect(profileService.getOpusVocabulary).toHaveBeenCalledWith("opus1", "vocab1");
    });
});
describe("GlossaryController tests", function () {
    var controller;
    var scope;
    var form;
    var messageService;
    var profileService;
    var http;
    var util = {
        getQueryParameter: function(param) {},
        confirm: function(msg) {},
        getEntityId: function(entity) {return "1234"}
    };
    var location;
    var uploadDefer, getGlossaryDefer, deleteItemDefer, saveItemDefer, confirmDefer, modalDefer;

    var getGlossaryResponse = '{"uuid":"glossaryId1", "items": [{"uuid": "item1", "term": "a", "description": "desc1"}, {"uuid": "item2", "term": "c", "description": "desc2"}, {"uuid": "item3", "term": "b", "description": "desc3"}]}';

    var modal = {
        open: function() {}
    };

    beforeAll(function () {
        console.log("****** Glossary Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_, _$location_) {
        scope = $rootScope.$new();
        profileService = _profileService_;
        location = _$location_;

        uploadDefer = $q.defer();
        getGlossaryDefer = $q.defer();
        deleteItemDefer = $q.defer();
        saveItemDefer = $q.defer();
        confirmDefer = $q.defer();
        modalDefer = $q.defer();

        var popup = {
            result: modalDefer.promise
        };
        spyOn(modal, "open").and.returnValue(popup);

        spyOn(profileService, "getGlossary").and.returnValue(getGlossaryDefer.promise);
        spyOn(profileService, "saveGlossaryItem").and.returnValue(saveItemDefer.promise);
        spyOn(profileService, "deleteGlossaryItem").and.returnValue(deleteItemDefer.promise);
        spyOn(profileService, "uploadGlossary").and.returnValue(uploadDefer.promise);

        spyOn(util, "confirm").and.returnValue(confirmDefer.promise);

        spyOn(location, "search");

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("GlossaryController as glossaryCtrl", {
            $scope: scope,
            profileService: profileService,
            util: util,
            messageService: messageService,
            $modal: modal
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

    beforeEach(inject(function (_$httpBackend_) {
        http = _$httpBackend_;
        http.whenGET(/\/path\/opus\/(.+)\/json/)
            .respond([200, {uuid: 'opus', title: 'opus'}]);
    }));

    it("should initialise the prefix and page to 'a' when there is no page query parameter when the controller loads", function() {
        spyOn(util, "getQueryParameter").and.returnValue(null);

        scope.glossaryCtrl.initialisePrefix();

        expect(scope.glossaryCtrl.prefix).toBe("a");
        expect(scope.glossaryCtrl.page).toBe("a");
    });

    it("should initialise the prefix and page to the value of the page query parameter when the controller loads", function() {
        spyOn(util, "getQueryParameter").and.returnValue("prefix");

        scope.glossaryCtrl.initialisePrefix();

        expect(scope.glossaryCtrl.prefix).toBe("prefix");
        expect(scope.glossaryCtrl.page).toBe("p");
    });

    it("should do nothing when loadGlossary is called but there is no opus Id", function () {
        scope.glossaryCtrl.opusId = null;

        scope.glossaryCtrl.loadGlossary();

        expect(profileService.getGlossary).not.toHaveBeenCalled();
    });

    it("should set the current prefix to the provided value and the current page to the first char when loadGlossary is called", function () {
        scope.glossaryCtrl.opusId = "12354";

        scope.glossaryCtrl.loadGlossary("prefix");

        expect(scope.glossaryCtrl.prefix).toBe("prefix");
        expect(scope.glossaryCtrl.page).toBe("p");
    });

    it("should invoke the getGlossary service method when loadGlossary is invoked", function() {
        scope.glossaryCtrl.opusId  = "opusId";
        scope.glossaryCtrl.prefix = "pre";

        scope.glossaryCtrl.loadGlossary();

        expect(profileService.getGlossary).toHaveBeenCalledWith("opusId", "pre");
    });

    it("should raise an alert message when the glossary cannot be loaded", function() {
        scope.glossaryCtrl.opusId  = "opusId";
        scope.glossaryCtrl.prefix = "pre";

        getGlossaryDefer.reject();
        scope.glossaryCtrl.loadGlossary();
        scope.$apply();

        http.expectGET('/path/opus/opusId/json');
        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should sort the glossary items alphabetically when loadGlossary is invoked", function() {
        scope.glossaryCtrl.opusId  = "opusId";
        scope.glossaryCtrl.prefix = "pre";

        getGlossaryDefer.resolve(JSON.parse(getGlossaryResponse));
        scope.glossaryCtrl.loadGlossary();
        scope.$apply();

        http.expectGET('/path/opus/opusId/json');
        expect(scope.glossaryCtrl.glossary).toBeDefined();
        // the order of the response is a, c, b
        expect(scope.glossaryCtrl.glossary.items[0].term).toBe("a");
        expect(scope.glossaryCtrl.glossary.items[1].term).toBe("b");
        expect(scope.glossaryCtrl.glossary.items[2].term).toBe("c");
    });

    it("should set the 'page' URL query parameter to the value of the prefix when the glossary is loaded", function() {
        scope.glossaryCtrl.opusId  = "opusId";
        scope.glossaryCtrl.prefix = "pre";

        getGlossaryDefer.resolve(JSON.parse(getGlossaryResponse));
        scope.glossaryCtrl.loadGlossary();
        scope.$apply();

        http.expectGET('/path/opus/opusId/json');
        expect(location.search).toHaveBeenCalledWith("page", "pre");
    });

    it("should display a confirmation dialog when deleteGlossaryItem is invoked", function () {
        scope.glossaryCtrl.deleteGlossaryItem(1);
        scope.$apply();

        expect(util.confirm).toHaveBeenCalled();
    });

    it("should not delete the glossary item if the confirmation is cancelled", function () {
        scope.glossaryCtrl.glossary = {items: [{uuid: "1"},{uuid: "2"},{uuid: "3"}]};
        scope.glossaryCtrl.opusId = "opusId";

        confirmDefer.reject();

        scope.glossaryCtrl.deleteGlossaryItem(1);
        scope.$apply();

        expect(util.confirm).toHaveBeenCalled();
        expect(scope.glossaryCtrl.glossary.items.length).toBe(3);
    });

    it("should invoke profileService if the confirmation has been confirmed", function () {
        scope.glossaryCtrl.glossary = {items: [{uuid: "1"},{uuid: "2"},{uuid: "3"}]};
        scope.glossaryCtrl.opusId = "opusId";

        confirmDefer.resolve({});
        deleteItemDefer.resolve({});
        scope.glossaryCtrl.deleteGlossaryItem(1);
        scope.$apply();

        expect(profileService.deleteGlossaryItem).toHaveBeenCalledWith("opusId", "2");
        expect(scope.glossaryCtrl.glossary.items.length).toBe(2);
        expect(scope.glossaryCtrl.glossary.items[0].uuid).toBe("1");
        expect(scope.glossaryCtrl.glossary.items[1].uuid).toBe("3");
    });

    it("should raise an alert message if the delete fails", function () {
        scope.glossaryCtrl.glossary = {items: [{uuid: "1"},{uuid: "2"},{uuid: "3"}]};
        scope.glossaryCtrl.opusId = "opusId";

        confirmDefer.resolve({});
        deleteItemDefer.reject();
        scope.glossaryCtrl.deleteGlossaryItem(1);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
        expect(scope.glossaryCtrl.glossary.items.length).toBe(3);
    });

    it("should do nothing when upload is invoked but a file has not been provided", function() {
        scope.glossaryCtrl.newFile = null;

        scope.glossaryCtrl.upload();

        expect(util.confirm).not.toHaveBeenCalled();
    });

    it("should display a confirmation dialog when upload is invoked with a file", function() {
        scope.glossaryCtrl.newFile = "a file";

        scope.glossaryCtrl.upload();

        expect(util.confirm).toHaveBeenCalled();
    });

    it("should do nothing when upload is invoked but the confirmation is rejected", function() {
        scope.glossaryCtrl.newFile = "a file";

        confirmDefer.reject();
        scope.glossaryCtrl.upload();
        scope.$apply();

        expect(profileService.uploadGlossary).not.toHaveBeenCalled();
    });

    it("should invoke the uploadGlossary method of the profile service when upload is invoked", function () {
        scope.glossaryCtrl.opusId = "opusId1";
        scope.glossaryCtrl.newFile = "a file";

        confirmDefer.resolve({});
        uploadDefer.resolve({});

        scope.glossaryCtrl.upload();
        scope.$apply();

        // we cannot actually inspect the content of the FormData object, unfortunately.
        expect(profileService.uploadGlossary).toHaveBeenCalledWith("opusId1", jasmine.any(FormData));

        expect(scope.glossaryCtrl.newFile).toBe(null);
    });

    it("should raise an alert message if the upload fails", function () {
        scope.glossaryCtrl.opusId = "opusId1";
        scope.glossaryCtrl.newFile = "a file";

        confirmDefer.resolve({});
        uploadDefer.reject({});

        scope.glossaryCtrl.upload();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should open the modal dialog when addGlossaryItem is invoked", function() {
        scope.glossaryCtrl.addGlossaryItem();

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/editItemPopup.htm"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({ controller: "GlossaryModalController"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controllerAs: "glossaryModalCtrl"}));
    });

    it("should open the modal dialog when editGlossaryItem is invoked", function() {
        scope.glossaryCtrl.editGlossaryItem(1);

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/editItemPopup.htm"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({ controller: "GlossaryModalController"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controllerAs: "glossaryModalCtrl"}));
    });

    it("should replace the specified item with the edited item when the edit item modal is closed", function() {
        scope.glossaryCtrl.glossary = {items: [{uuid: "1"},{uuid: "2"},{uuid: "3"}]};

        modalDefer.resolve({uuid: "newId"});

        scope.glossaryCtrl.editGlossaryItem(1);
        scope.$apply();

        http.expectGET('/path/opus/opusId/json');
        expect(scope.glossaryCtrl.glossary.items[1].uuid).toBe("newId");
    });

    it("should set the prefix and page attributes to the first letter of the new item's term, and load the glossary when the add item popup is closed", function() {
        scope.glossaryCtrl.glossary = {items: [{uuid: "1"},{uuid: "2"},{uuid: "3"}]};

        modalDefer.resolve({uuid: "newId", term: "term"});

        scope.glossaryCtrl.addGlossaryItem();
        scope.$apply();

        expect(scope.glossaryCtrl.prefix).toBe("t");
        expect(scope.glossaryCtrl.page).toBe("t");
        expect(profileService.getGlossary).toHaveBeenCalled();
    });

});


/**
 * Glossary popup controller test
 */

describe("GlossaryModalController tests", function () {
    var controller;
    var scope;
    var profileService;

    var saveDefer;

    var modalInstance = {
        dismiss: function(d) {},
        close: function(d) {}
    };


    beforeAll(function () {
        console.log("****** Glossary Modal Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, util) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        saveDefer = $q.defer();

        spyOn(profileService, "saveGlossaryItem").and.returnValue(saveDefer.promise);

        spyOn(modalInstance, "close");
        spyOn(modalInstance, "dismiss");

        spyOn(util, "getEntityId").and.returnValue("opusId");

        controller = $controller("GlossaryModalController as glossaryCtrl", {
            $scope: scope,
            profileService: profileService,
            $modalInstance: modalInstance,
            util: util,
            item: {}
        });

    }));

    it("should dismiss the modal when cancel is invoked", function() {
        scope.glossaryCtrl.cancel();

        expect(modalInstance.dismiss).toHaveBeenCalled();
    });

    it("Should set the error attribute if an error occurs while saving", function() {
        saveDefer.reject();

        scope.glossaryCtrl.ok();
        scope.$apply();

        expect(scope.glossaryCtrl.error).toBe("An error occurred while saving the item.")
    });

    it("should invoke saveGlossaryItem when OK is selected", function() {
        var item = {uuid: "item1"};
        scope.glossaryCtrl.item = item;
        saveDefer.resolve(item);
        scope.glossaryCtrl.ok();
        scope.$apply();

        expect(scope.glossaryCtrl.error).toBe(null);
        expect(profileService.saveGlossaryItem).toHaveBeenCalledWith("opusId", "item1", item);
    });

    it("should close the modal instance, passing in updated item, when saveGlossaryItem succeeds", function() {
        var item = {uuid: "newuuid"};

        saveDefer.resolve({uuid: "newuuid"});

        scope.glossaryCtrl.ok();
        scope.$apply();

        expect(modalInstance.close).toHaveBeenCalledWith(item);
    });
});
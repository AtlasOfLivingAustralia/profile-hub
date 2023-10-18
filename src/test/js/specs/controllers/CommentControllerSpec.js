describe("CommentController tests", function () {
    var controller;
    var scope;
    var form;
    var messageService;
    var profileService;
    var util;
    var location;
    var getDefer, saveDefer, updateDefer, deleteDefer, confirmDefer;

    beforeAll(function () {
        console.log("****** Comment Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_, _util_) {
        scope = $rootScope.$new();
        profileService = _profileService_;
        util = _util_;

        getDefer = $q.defer();
        saveDefer = $q.defer();
        updateDefer = $q.defer();
        deleteDefer = $q.defer();
        confirmDefer = $q.defer();

        spyOn(profileService, "getComments").and.returnValue(getDefer.promise);
        spyOn(profileService, "addComment").and.returnValue(saveDefer.promise);
        spyOn(profileService, "updateComment").and.returnValue(updateDefer.promise);
        spyOn(profileService, "deleteComment").and.returnValue(deleteDefer.promise);

        spyOn(util, "confirm").and.returnValue(confirmDefer.promise);

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("CommentController as ctrl", {
            $scope: scope,
            profileService: profileService,
            util: util,
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

    it("should load all comments for the profile and sort them by created date when the controller loads", function() {
        getDefer.resolve([{text: "Text1", uuid: "comment1", dateCreated: new Date(2015, 1, 1)},
            {text: "Text2", uuid: "comment2", dateCreated: new Date(2013, 1, 1)},
            {text: "Text3", uuid: "comment3", dateCreated: new Date(2014, 1, 1)}]);
        scope.ctrl.opusId = "opusId";
        scope.ctrl.profileId = "profileId";
        scope.ctrl.loadComments();
        scope.$apply();

        expect(profileService.getComments).toHaveBeenCalledWith("opusId", "profileId");
        expect(scope.ctrl.comments.length).toBe(3);
        expect(scope.ctrl.comments[0].uuid).toBe("comment2");
        expect(scope.ctrl.comments[1].uuid).toBe("comment3");
        expect(scope.ctrl.comments[2].uuid).toBe("comment1");
    });

    it("should set the currentComment attribute to a new object with empty text and the profileId when addComment is invoked", function() {
        scope.ctrl.profileId = "profileId";
        scope.ctrl.addComment();

        expect(scope.ctrl.currentComment.text).toBe("");
        expect(scope.ctrl.currentComment.profileUuid).toBe("profileId");
    });

    it("should set the currentComment to a COPY of the specified comment when editComment is invoked", function() {
        var comment2 = {text: "Text2", uuid: "comment2", dateCreated: new Date(2014, 1, 1)};
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1)},
            comment2,
            {text: "Text3", uuid: "comment3", dateCreated: new Date(2015, 1, 1)}];
        scope.ctrl.savedComments = scope.ctrl.comments;

        scope.ctrl.editComment([1]);

        // should not be the same object, but should be equal (i.e. a copy)
        expect(scope.ctrl.currentComment).not.toBe(comment2);
        expect(scope.ctrl.currentComment).toEqual(comment2);
    });

    it("should set the current comment to null when cancel is invoked", function() {
        scope.ctrl.currentComment = {uuid: "one"};

        scope.ctrl.cancel();

        expect(scope.ctrl.currentComment).toBe(null);
    });

    it("should display a confirmation dialog when deleteComment is invoked", function() {
        scope.ctrl.deleteComment();

        expect(util.confirm).toHaveBeenCalled();
    });

    it("should remove the specified comment and invoke the deleteComment service when the delete is confirmed", function() {
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1)},
            {text: "Text2", uuid: "comment2", dateCreated: new Date(2014, 1, 1)},
            {text: "Text3", uuid: "comment3", dateCreated: new Date(2015, 1, 1)}];
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";
        scope.ctrl.savedComments = scope.ctrl.comments;

        confirmDefer.resolve({});
        deleteDefer.resolve({});
        scope.ctrl.deleteComment([1]);
        scope.$apply();

        expect(profileService.deleteComment).toHaveBeenCalledWith("opusId", "profileId", "comment2");
        expect(scope.ctrl.comments.length).toBe(2);
        expect(scope.ctrl.comments[0].uuid).toBe("comment1");
        expect(scope.ctrl.comments[1].uuid).toBe("comment3");
    });

    it("should remove the specified child comment and invoke the deleteComment service when the delete is confirmed", function() {
        scope.ctrl.comments = [{text: "level0", uuid: "comment1", dateCreated: new Date(2013, 1, 1),
            children: [
                {text: "level1", uuid: "comment2", dateCreated: new Date(2014, 1, 1),
                    children: [
                        {text: "level2, first", uuid: "comment3", dateCreated: new Date(2015, 1, 1)},
                        {text: "level2, second", uuid: "comment4", dateCreated: new Date(2015, 1, 1)}]}
            ]}];
        scope.ctrl.savedComments = scope.ctrl.comments;
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        confirmDefer.resolve({});
        deleteDefer.resolve({});
        scope.ctrl.deleteComment([0, 0, 1]); // should be the 'level2, second' comment
        scope.$apply();

        expect(profileService.deleteComment).toHaveBeenCalledWith("opusId", "profileId", "comment4");
        expect(scope.ctrl.comments[0].children[0].children.length).toBe(1);
        expect(scope.ctrl.comments[0].children[0].children[0].uuid).toBe("comment3");
    });

    it("should do nothing if the delete is not confirmed", function() {
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1)},
            {text: "Text2", uuid: "comment2", dateCreated: new Date(2014, 1, 1)},
            {text: "Text3", uuid: "comment3", dateCreated: new Date(2015, 1, 1)}];
        scope.ctrl.savedComments = scope.ctrl.comments;
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        confirmDefer.reject({});
        scope.ctrl.deleteComment(1);
        scope.$apply();

        expect(profileService.deleteComment).not.toHaveBeenCalled();
    });

    it("should raise an alert message and leave the commnet if the delete fails", function() {
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1)},
            {text: "Text2", uuid: "comment2", dateCreated: new Date(2014, 1, 1)},
            {text: "Text3", uuid: "comment3", dateCreated: new Date(2015, 1, 1)}];
        scope.ctrl.savedComments = scope.ctrl.comments;
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        confirmDefer.resolve({});
        deleteDefer.reject({});
        scope.ctrl.deleteComment([1]);
        scope.$apply();

        expect(profileService.deleteComment).toHaveBeenCalledWith("opusId", "profileId", "comment2");
        expect(scope.ctrl.comments.length).toBe(3);
        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should invoke the addComment service and push the new comment into the list when saveComment is called for a new comment", function() {
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1)}];
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        var comment = {text: "new text", profileUuid: "profileId"};
        scope.ctrl.currentComment = comment;

        saveDefer.resolve({});
        scope.ctrl.saveComment([1]);
        scope.$apply();

        expect(profileService.addComment).toHaveBeenCalledWith("opusId", "profileId", comment);
        expect(scope.ctrl.comments.length).toBe(2);
    });

    it("should invoke the updateComment service and modify the existing comment in the list when saveComment is called for an edited comment", function() {
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1)}];
        scope.ctrl.savedComments = scope.ctrl.comments;
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        var comment = {text: "updated text", profileUuid: "profileId", uuid: "comment1"};
        scope.ctrl.currentComment = comment;

        updateDefer.resolve({});
        scope.ctrl.saveComment([0]);
        scope.$apply();

        expect(profileService.updateComment).toHaveBeenCalledWith("opusId", "profileId", "comment1", comment);
        expect(scope.ctrl.comments.length).toBe(1);
        expect(scope.ctrl.comments[0].text).toBe("updated text");
    });

    it("should invoke the updateComment service and modify the existing child comment in the list when saveComment is called for an edited reply", function() {
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1), children: [
            {text: "Child1", uuid: "child1", dateCreated: new Date(2013, 1, 1)},
            {text: "Child2", uuid: "child2", dateCreated: new Date(2013, 1, 1)}]
        }];
        scope.ctrl.savedComments = scope.ctrl.comments;
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        var comment = {text: "updated text", profileUuid: "profileId", uuid: "child2"};
        scope.ctrl.currentComment = comment;

        updateDefer.resolve({});
        scope.ctrl.saveComment([0, 1]);
        scope.$apply();

        expect(profileService.updateComment).toHaveBeenCalledWith("opusId", "profileId", "child2", comment);
        expect(scope.ctrl.comments.length).toBe(1);
        expect(scope.ctrl.comments[0].children[1].text).toBe("updated text");
    });

    it("should raise an alert message and not modify the comments list when saveComment fails for a new comment", function() {
        scope.ctrl.comments = [{text: "Text1", uuid: "comment1", dateCreated: new Date(2013, 1, 1)}];
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        scope.ctrl.currentComment = {text: "new text", profileUuid: "profileId"};

        saveDefer.reject({});
        scope.ctrl.saveComment([1]);
        scope.$apply();

        expect(scope.ctrl.comments.length).toBe(1);
        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should raise an alert message and not modify the comments list when saveComment fails for an edited comment", function() {
        scope.ctrl.comments = [{text: "original text", uuid: "comment1", dateCreated: new Date(2013, 1, 1)}];
        scope.ctrl.profileId = "profileId";
        scope.ctrl.opusId = "opusId";

        scope.ctrl.currentComment = {text: "updated text", profileUuid: "profileId", uuid: "comment1"};

        updateDefer.reject({});
        scope.ctrl.saveComment([0]);
        scope.$apply();

        expect(scope.ctrl.comments.length).toBe(1);
        expect(scope.ctrl.comments[0].text).toBe("original text");
        expect(messageService.alert).toHaveBeenCalled();
    });
});

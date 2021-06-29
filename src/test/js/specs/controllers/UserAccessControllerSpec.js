describe("UserAccessController tests", function () {
    var controller;
    var scope;

    var form;
    var messageService;
    var profileService;
    var util;
    var searchDefer, updateDefer, opusDefer, confirmDefer, modalDefer;

    var user1 = {userId: "1", firstName: "fred", lastName: "smith", email: "fred@smith.com"};
    var user2 = {userId: "2", firstName: "jane", lastName: "doe", email: "jane@doe.com"};
    var user3 = {userId: "3", firstName: "fred", lastName: "bloggs", email: "fred@bloggs.com"};

    var updateUserResponse = '{}';

    var modal = {
        open: function () {
        }
    };

    beforeAll(function () {
        console.log("****** User Access Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_, _util_) {
        scope = $rootScope.$new();
        profileService = _profileService_;
        util = _util_;

        searchDefer = $q.defer();
        updateDefer = $q.defer();
        opusDefer = $q.defer();
        confirmDefer = $q.defer();
        modalDefer = $q.defer();

        var popup = {
            result: modalDefer.promise
        };
        spyOn(modal, "open").and.returnValue(popup);

        spyOn(profileService, "userSearch").and.returnValue(searchDefer.promise);
        spyOn(profileService, "updateUsers").and.returnValue(updateDefer.promise);
        spyOn(profileService, "getOpus").and.returnValue(opusDefer.promise);

        spyOn(util, "confirm").and.returnValue(confirmDefer.promise);


        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

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

        controller = $controller("UserAccessController as userCtrl", {
            $scope: scope,
            profileService: profileService,
            util: util,
            messageService: messageService,
            $modal: modal
        });
    }));


    it("should display a confirmation dialog when deleteUser is invoked", function () {
        scope.userCtrl.deleteUser("bla", form);

        expect(util.confirm).toHaveBeenCalled();
    });

    it("should remove the specified user from the list when delete user is invoked and the confirmation is accepted", function () {
        scope.userCtrl.users = [{userId: "user1"}, {userId: "user2"}, {userId: "user3"}];

        confirmDefer.resolve({});
        scope.userCtrl.deleteUser("user2", form);
        scope.$apply();

        expect(scope.userCtrl.users.length).toBe(2);
        expect(scope.userCtrl.users[0].userId).toBe("user1");
        expect(scope.userCtrl.users[1].userId).toBe("user3");
        expect(form.$setDirty).toHaveBeenCalled();
    });

    it("should do nothing if the specified user is not recognised when delete user is invoked", function () {
        scope.userCtrl.users = [{userId: "user1"}, {userId: "user2"}, {userId: "user3"}];

        confirmDefer.resolve({});
        scope.userCtrl.deleteUser("unknown", form);
        scope.$apply();

        expect(scope.userCtrl.users.length).toBe(3);
        expect(form.$setDirty).not.toHaveBeenCalled();
    });

    it("should open the modal dialog when addUser is invoked", function () {
        scope.userCtrl.addUser(form);

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/addEditUserPopup.htm"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controller: "AddEditUserController"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controllerAs: "addUserCtrl"}));
    });

    it("should open the modal dialog when editUser is invoked", function () {
        scope.userCtrl.users = [{userId: "user1"}, {userId: "user2"}, {userId: "user3"}];

        scope.userCtrl.editUser("user2", form);

        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({templateUrl: "/profileEditor/addEditUserPopup.htm"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controller: "AddEditUserController"}));
        expect(modal.open).toHaveBeenCalledWith(jasmine.objectContaining({controllerAs: "addUserCtrl"}));
    });

    it("should replace the specified user with the edited details when the edit modal is closed", function () {
        scope.userCtrl.users = [{userId: "user1"}, {userId: "user2"}, {userId: "user3"}];

        modalDefer.resolve({userId: "user2", notes: "new notes"});

        scope.userCtrl.editUser("user2", form);
        scope.$apply();

        expect(scope.userCtrl.users.length).toBe(3);
        expect(scope.userCtrl.users[1].notes).toBe("new notes");
    });

    it("should add the new user with the object from the popup when the add modal is closed", function () {
        scope.userCtrl.users = [{userId: "user1"}, {userId: "user2"}, {userId: "user3"}];

        modalDefer.resolve({userId: "user4"});

        scope.userCtrl.addUser(form);
        scope.$apply();

        expect(scope.userCtrl.users.length).toBe(4);
        expect(scope.userCtrl.users[3].userId).toBe("user4");
    });


    it("should raise a success message when the call to updateUsers succeeds", function () {
        updateDefer.resolve(JSON.parse(updateUserResponse));

        scope.userCtrl.opus = {privateCollection: false};

        scope.userCtrl.save(form);
        scope.$apply();

        expect(messageService.success).toHaveBeenCalledWith("User access has been successfully updated.");
    });

    it("should raise an alert message when the call to updateUsers fails", function () {
        updateDefer.reject();

        scope.userCtrl.opus = {privateCollection: false};

        scope.userCtrl.save(form);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("An error has occurred while updating user access.");
    });

    it("should remove the User role from the list of roles when private mode is disabled", function () {
        scope.userCtrl.roles.push(scope.userCtrl.userRole);

        scope.userCtrl.opus = {privateCollection: false};
        scope.userCtrl.privateModeChanged();

        expect(scope.userCtrl.roles).toEqual([{name: "Admin", key: "ROLE_PROFILE_ADMIN"},
            {name: "Author", key: "ROLE_PROFILE_AUTHOR"},
            {name: "Reviewer", key: "ROLE_PROFILE_REVIEWER"},
            {name: "Editor", key: "ROLE_PROFILE_EDITOR"}]);

    });

    it("should add the User role to the list of roles when private mode is enabled", function () {
        scope.userCtrl.opus = {privateCollection: true};
        scope.userCtrl.privateModeChanged();

        expect(scope.userCtrl.roles).toEqual([{name: "Admin", key: "ROLE_PROFILE_ADMIN"},
            {name: "Author", key: "ROLE_PROFILE_AUTHOR"},
            {name: "Reviewer", key: "ROLE_PROFILE_REVIEWER"},
            {name: "Editor", key: "ROLE_PROFILE_EDITOR"},
            {name: "User", key: "ROLE_USER"}]);
    });

});


/**
 * Add/edit user popup controller test
 */

describe("AddEditUserController tests", function () {
    var controller;
    var scope;
    var profileService;

    var searchDefer;

    var user1 = {userId: "user1", firstName: "fred", lastName: "smith", email: "fred@smith.com"};
    var user2 = {userId: "user2", firstName: "jane", lastName: "doe", email: "jane@doe.com"};
    var user3 = {userId: "3", firstName: "fred", lastName: "bloggs", email: "fred@bloggs.com"};

    var modalInstance = {
        dismiss: function (d) {
        },
        close: function (d) {
        }
    };


    beforeAll(function () {
        console.log("****** Add/Edit User Modal Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, util) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        searchDefer = $q.defer();

        spyOn(profileService, "userSearch").and.returnValue(searchDefer.promise);

        spyOn(modalInstance, "close");
        spyOn(modalInstance, "dismiss");

        controller = $controller("AddEditUserController as ctrl", {
            $scope: scope,
            profileService: profileService,
            $modalInstance: modalInstance,
            users: [{userId: "user1"}, {userId: "user2"}],
            user: {},
            roles: [{key: "ROLE1"}, {key: "ROLE2"}],
            isNewUser: true
        });

    }));

    it("should dismiss the modal when cancel is invoked", function () {
        scope.ctrl.cancel();

        expect(modalInstance.dismiss).toHaveBeenCalled();
    });

    it("Should set the error attribute if an error occurs while searching", function () {
        searchDefer.reject();

        scope.ctrl.userSearch("email");
        scope.$apply();

        expect(scope.ctrl.error).toBe("An error has occurred while searching for the user.")
    });

    it("should set the user attribute on the current scope when the call to searchUser finds a match", function () {
        searchDefer.resolve(user3);
        scope.searchTerm = "test";
        scope.ctrl.userSearch();
        scope.$apply();

        expect(scope.ctrl.user.userId).toBe(user3.userId);
    });

    it("should set the user.name attribute on the current scope when the call to searchUser finds a match", function () {
        searchDefer.resolve(user3);
        scope.searchTerm = "test";
        scope.ctrl.userSearch();
        scope.$apply();

        expect(scope.ctrl.user.name).toBeDefined();
        expect(scope.ctrl.user.name).toBe(user3.firstName + ' ' + user3.lastName);
    });

    it("should set the error attribute when the search returns a user who has already been authorised", function () {
        scope.ctrl.users = [{userId: "user1"}];

        searchDefer.resolve(user1);
        scope.ctrl.userSearch("test");
        scope.$apply();

        expect(scope.ctrl.error).toBe("This user has already been assigned a role.");
    });

    it("should close the modal instance, passing in updated user, when OK is invoked", function () {
        var user = {userId: "newUser"};
        scope.ctrl.user = user;
        scope.ctrl.ok();
        scope.$apply();

        expect(modalInstance.close).toHaveBeenCalledWith(user);
    });
});
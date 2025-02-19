(function() {
    "use strict";

    function MasterListController($scope, $http, $log, config, messageService, profileService, $timeout) {
        var self = this;

        self.lists = [];
        $http.get(config.listServiceUrl + '/speciesList/', { params: { 'listType': config.masterListType, page: 1, pageSize: 1000, user: config.currentUserId } })
            .then(function(response) {
                self.lists = response.data.lists;
            }, function(response) {
                messageService.alert("Could not load Master List candidates")
            });

        // injected self.opus
        function setUID() {
            var masterListUid;
            masterListUid = self.opus ? self.opus.masterListUid || null : null;
            self.masterListUid = masterListUid;
        }
        $scope.$watch(function() { return self.opus }, function () {
            if(self.opus) {
                setUID();
                checkMasterlistSyncStatus();
            }
        });
        setUID();
        self.isEdittable = true;

        self.saveMasterList = function() {
            profileService.updateMasterList(self.opus.uuid, self.masterListUid).then(
                function(response) {
                    // The above call will return almost immediately
                    self.isMasterListSyncing = true
                    self.opus.masterListUid = self.masterListUid;
                    self.MasterListForm.$setPristine();
                    messageService.success("Master list update has been scheduled.");
                }, function (response) {
                    $log.error("Couldn't update master list for opus", opus, response);
                    messageService.alert("Failed to schedule master list update.");
                }
            )
        };

        self.clearMasterList = function() {
            self.masterListUid = undefined;
            self.MasterListForm.$setDirty();
        };

        self.syncNow = function(regen) {
            messageService.info("Syncing master list...");
                // Pre-emtive status betting no error will be fired by the call, otherwise
                // checkMasterlistSyncStatus will fix that in next run
                self.isMasterListSyncing = true
                profileService.syncMasterList(self.opus.uuid, regen).then(
                function(response) {
                    messageService.success("Master list sync completed");
                }, function(error) {
                    messageService.alert("Master list sync failed.");
                }
            );
        };

        self.isMasterListSyncing = false;


        // NG Polling code taken from
        // Simple Server Polling in AngularJS Done Right
        // https://blog.guya.net/2016/08/08/simple-server-polling-in-angularjs-done-right/
        var loadTime = 15000, //Load the data every 15 seconds
            errorCount = 0, //Counter for the server errors
            stopPollingAfterNoErrors = 20, // After 20 Errors don't poll anymore
            loadPromise; //Pointer to the promise created by the Angular $timeout service

        function checkMasterlistSyncStatus() {
            $log.debug("Chceking masterlist sync status");
            if (!self.opus.uuid) return;
            profileService.isMasterListSyncing(self.opus.uuid)
                .then(function(res) {
                    self.isMasterListSyncing = res.response;
                    errorCount = 0;
                    scheduleNextMasterlistSyncStatusCheck();
                })
                .catch(function(error) {
                    // No UI report need it. we simply
                    $log.error("Failed to check masterlist sync status", error);
                    if(errorCount < stopPollingAfterNoErrors) {
                        scheduleNextMasterlistSyncStatusCheck(++errorCount * loadTime);
                    } else {
                        $log.warn("Failed to check masterlist sync status for the last " + errorCount + "attempts. Polling will be stopped");
                    }
                });
        };

        function cancelMasterlistSyncStatusPolling() {
            $timeout.cancel(loadPromise);
        };

        function scheduleNextMasterlistSyncStatusCheck(mill) {
            mill = mill || loadTime;

            //Always make sure the last timeout is cleared before starting a new one
            cancelMasterlistSyncStatusPolling();
            loadPromise = $timeout(checkMasterlistSyncStatus, mill);
        };

        //Always clear the timeout when the view is destroyed, otherwise it will keep polling and leak memory
        $scope.$on('$destroy', function() {
            cancelMasterlistSyncStatusPolling();
        });

    }

    profileEditor.directive('masterList', function() {
        return {
            restrict: 'AE',
            scope: {
                opus: '=',
                helpUrl: '@'
            },
            controller: MasterListController,
            controllerAs: '$ctrl',
            bindToController: true,
            templateUrl: '/profileEditor/masterList.htm'
        };
    });
})();
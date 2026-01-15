/**
 * Opus controller
 */
profileEditor.controller('OpusController', function ($log, $scope, profileService, util, messageService, $window, $filter) {
    var self = this;

    var SUPPORTING_COLLECTION_REQUESTED = "REQUESTED";
    var SUPPORTING_COLLECTION_APPROVED = "APPROVED";
    var SUPPORTING_COLLECTION_REJECTED = "REJECTED";

    self.profilePageLayouts = [
        {
            name: "singleTab",
            displayText: "Show all content on a single page",
            description: "All Profile content will be displayed on a single tab, with the exception of keys and attachments (if present)"
        },
        {
            name: "tabbed",
            displayText: "Show content on tabs",
            description: "Profile content will be split across the following tabs: Profile, Distribution, Gallery, Literature & Links, Key"
        }
    ];

    self.opus = null;
    self.opusId = null;
    self.opusList = [];
    self.readonly = true;
    self.dataResource = null;
    self.dataHub = null;

    self.allSpeciesLists = [];
    self.saving = false;
    self.supportingOpuses = []; // separate list because the opus contains two sets of supporting opuses (approved and requested)
    self.newSupportingOpuses = [];
    self.newApprovedLists = [];
    self.newFeatureLists = [];
    self.valid = false;
    self.editors = [];
    self.initialShortName = null;
    self.urlSuffix = null;

    self.keybaseTemplateUrl = undefined;
    self.keybaseProjects = [];
    self.selectedKeybaseProject = null;
    self.shortNameTipVisible = false;

    self.showUpload = {
        opusBanner: false,
        profileBanner: false,
        thumbnail: false,
        logo: false,
        imageSlider: false
    };

    self.collectoryResourceOptions = {
        NONE: "My collection only",
        ALL: "All ALA data resources",
        HUBS: "Specific groups of resources ('hubs')",
        RESOURCES: "Specific resources"
    };

    var defaultMultiSelectOptions = {
        filterPlaceHolder: 'Start typing to filter the list below.',
        labelAll: 'Available data sources',
        labelSelected: 'Selected data sources',
        orderProperty: 'name'
    };
    self.recordHubMultiSelectOptions = {
        selectedItems: [],
        items: []
    };
    self.recordResourceMultiSelectOptions = {
        selectedItems: [],
        items: []
    };
    _.defaults(self.recordResourceMultiSelectOptions, defaultMultiSelectOptions);
    _.defaults(self.recordHubMultiSelectOptions, defaultMultiSelectOptions);
    self.imageHubMultiSelectOptions = {
        selectedItems: [],
        items: []
    };
    self.imageResourceMultiSelectOptions = {
        selectedItems: [],
        items: []
    };
    _.defaults(self.imageResourceMultiSelectOptions, defaultMultiSelectOptions);
    _.defaults(self.imageHubMultiSelectOptions, defaultMultiSelectOptions);
    self.opusDataResourceList = [];

    self.originalRecordResourceOption = null;
    self.originalImageResourceOption = null;

    self.imageUploadUrl = util.contextRoot() + "/opus/" + util.getEntityId("opus") + "/image?purpose=";

    var orderBy = $filter("orderBy");

    loadOpusList();

    loadTags();

    self.loadOpus = function () {
        self.opusId = util.getEntityId("opus");

        if (!self.opusId) {
            loadOpusDataResourceList();
            return;
        }
        var promise = profileService.getOpus(self.opusId);

        messageService.info("Loading opus data...");
        promise.then(function (data) {
                self.opus = data;
                if (_.isUndefined(self.opus.dataResourceConfig)) {
                    self.opus.dataResourceConfig = {
                        recordResourceOption: "NONE",
                        recordSources: [],
                        imageResourceOption: "NONE",
                        imageSources: []
                    };
                }

                removeSelectedTags();

                self.originalRecordResourceOption = self.opus.dataResourceConfig.recordResourceOption;
                self.originalImageResourceOption = self.opus.dataResourceConfig.imageResourceOption;

                angular.forEach(self.opus.authorities, function (auth) {
                    if (auth.role == "ROLE_PROFILE_EDITOR") {
                        self.editors.push({userId: auth.userId, name: auth.name})
                    }
                });

                self.initialShortName = data.shortName;
                self.urlSuffix = self.opus.shortName ? self.opus.shortName : self.opus.uuid;

                self.supportingOpuses = [].concat(self.opus.supportingOpuses);
                self.supportingOpuses = self.supportingOpuses.concat(self.opus.requestedSupportingOpuses);

                self.recordSourceOptionChanged();
                self.imageSourceOptionChanged();

                loadSpeciesLists();
                loadKeybaseProjects();

                toggleMapPointerColourHash(true);

                if (!self.readonly) {
                    loadOpusDataResourceList();
                }

                loadDataResource(self.opus.dataResourceUid);

                if (self.keybaseProjects && self.opus.keybaseProjectId) {
                    setSelectedKeybaseProject();
                }

                $window.document.title = self.opus.title + " | Profile Collections";
            },
            function () {
                messageService.alert("An error occurred while retrieving the opus.");
            }
        );
    };

    self.saveOpus = function (form) {
        messageService.info("Saving...");
        self.saving = true;

        toggleMapPointerColourHash(false);

        if (self.opus.shortName !== self.initialShortName && self.opus.shortName) {
            var f = profileService.getOpus(self.opus.shortName, true);
            f.then(function () {
                messageService.alert("The specified short name is already in use. Short Names must be unique across all collections.");
            }, function () {
                console.log("Short name is unique");

                save(form);
                // Fix for https://github.com/AtlasOfLivingAustralia/profile-hub/issues/719.
                // Config changes fails after saving changed short name.
                self.initialShortName = self.opus.shortName;
            })
        } else {
            save(form)
        }
    };

    function populateImageResources() {
        self.opus.dataResourceConfig.imageSources = [];
        if (self.opus.dataResourceConfig.imageResourceOption == "HUBS") {
            angular.forEach(self.imageHubMultiSelectOptions.selectedItems, function (source) {
                self.opus.dataResourceConfig.imageSources.push(source.id);
            });
        } else if (self.opus.dataResourceConfig.imageResourceOption == "RESOURCES") {
            angular.forEach(self.imageResourceMultiSelectOptions.selectedItems, function (source) {
                self.opus.dataResourceConfig.imageSources.push(source.id);
            });
        }
    }

    function populateRecordResources() {
        self.opus.dataResourceConfig.recordSources = [];
        if (self.opus.dataResourceConfig.recordResourceOption == "HUBS") {
            angular.forEach(self.recordHubMultiSelectOptions.selectedItems, function (source) {
                self.opus.dataResourceConfig.recordSources.push(source.id);
            });
        } else if (self.opus.dataResourceConfig.recordResourceOption == "RESOURCES") {
            angular.forEach(self.recordResourceMultiSelectOptions.selectedItems, function (source) {
                self.opus.dataResourceConfig.recordSources.push(source.id);
            });
        }
    }

    function save(form) {
        if (self.selectedKeybaseProject) {
            self.opus.keybaseProjectId = self.selectedKeybaseProject.project_id;
            self.opus.keybaseKeyId = self.selectedKeybaseProject.first_key.id;
        } else {
            self.opus.keybaseProjectId = "";
            self.opus.keybaseKeyId = "";
        }

        if (!self.opus.dataResourceConfig) {
            self.opus.dataResourceConfig = {};
        }

        populateRecordResources();
        populateImageResources();

        var promise = profileService.saveOpus(self.opusId, self.opus);
        promise.then(function (data) {
                toggleMapPointerColourHash(true);

                messageService.success("Successfully updated " + self.opus.title + ".");
                self.saving = false;
                if (form) {
                    form.$setPristine();
                }
                self.originalRecordResourceOption = self.opus.dataResourceConfig.recordResourceOption;
                self.originalImageResourceOption = self.opus.dataResourceConfig.imageResourceOption;

                if (!self.opus.uuid) {
                    self.opusId = data.uuid;
                    self.opus = data;
                    util.redirect(util.contextRoot() + "/opus/" + self.opus.uuid + "/update");
                }
            },
            function () {
                messageService.alert("Failed to update " + self.opus.title + ".");
                self.saving = false;
            }
        );
    }

    self.addSupportingOpus = function () {
        self.newSupportingOpuses.push({requestStatus: SUPPORTING_COLLECTION_REQUESTED});
    };

    self.saveSupportingOpuses = function (form) {
        var invalid = [];
        var valid = [];

        angular.forEach(self.newSupportingOpuses, function (selectedObject) {
            if (selectedObject.opus) {
                if (selectedObject.opus.uuid) {
                    valid.push(selectedObject.opus);
                } else {
                    invalid.push(selectedObject);
                }
            }
        });

        if (invalid.length == 0) {
            self.newSupportingOpuses = [];
            if (valid.length > 0) {
                angular.forEach(valid, function (opus) {
                    self.supportingOpuses.push(opus);
                });
            }

            var data = {
                supportingOpuses: self.supportingOpuses
            };

            if (typeof self.opus.autoApproveShareRequests != 'undefined') {
                data.autoApproveShareRequests = self.opus.autoApproveShareRequests;
            }
            if (typeof self.opus.allowCopyFromLinkedOpus != 'undefined') {
                data.allowCopyFromLinkedOpus = self.opus.allowCopyFromLinkedOpus;
            }
            if (typeof self.opus.showLinkedOpusAttributes != 'undefined') {
                data.showLinkedOpusAttributes = self.opus.showLinkedOpusAttributes;
            }

            var future = profileService.updateSupportingCollections(self.opusId, data);
            future.then(function () {
                messageService.success("Supporting collections have been successfully updated.");
                self.saving = false;
                form.$setPristine();
            }, function () {
                messageService.alert("An error has occurred while updating the supporting collections.");
            })
        } else if (invalid.length > 0) {
            messageService.alert(invalid.length + " supporting collection" + (invalid.length > 1 ? "s are" : " is") + " not valid. You must select items from the list.")
        }
    };

    self.supportingOpusSelected = function (supportingOpus) {
        supportingOpus.requestStatus = SUPPORTING_COLLECTION_REQUESTED;
    };

    self.revokeAccessToSupportedCollection = function (otherOpusUuid) {
        var confirm = util.confirm("Are you sure you wish to revoke access to your collection's data?");

        confirm.then(function () {
            var future = profileService.respondToSupportingCollectionRequest(self.opusId, otherOpusUuid, "revoke");

            future.then(function () {
                var indexToRemove = -1;
                angular.forEach(self.opus.sharingDataWith, function (opus, index) {
                    if (opus.uuid == otherOpusUuid) {
                        indexToRemove = index;
                    }
                });

                if (indexToRemove > -1) {
                    self.opus.sharingDataWith.splice(indexToRemove, 1);
                }
            })
        });
    };

    self.removeSupportingOpus = function (index, list, form) {
        if (list == 'existing') {
            self.supportingOpuses.splice(index, 1);
        } else {
            self.newSupportingOpuses.splice(index, 1);
        }
        form.$setDirty();
    };

    self.addApprovedList = function () {
        self.newApprovedLists.push({});
    };

    self.saveApprovedLists = function (form) {
        var invalid = [];
        var valid = [];

        angular.forEach(self.newApprovedLists, function (approvedList) {
            if (approvedList.list) {
                if (approvedList.list.dataResourceUid) {
                    valid.push(approvedList.list.dataResourceUid);
                } else {
                    invalid.push(approvedList);
                }
            }
        });

        if (invalid.length == 0) {
            self.newApprovedLists = [];
            if (valid.length > 0) {
                angular.forEach(valid, function (record) {
                    self.opus.approvedLists.push(record);
                });
            }
            self.saveOpus(form);
        } else if (invalid.length > 0) {
            messageService.alert(invalid.length + " list" + (invalid.length > 1 ? "s are" : " is") + " not valid. You must select items from the list.")
        }
    };

    self.removeApprovedList = function (index, list, form) {
        if (list == 'existing') {
            self.opus.approvedLists.splice(index, 1);
        } else {
            self.newApprovedLists.splice(index, 1);
        }
        form.$setDirty();
    };

    self.addFeatureList = function () {
        self.newFeatureLists.push({});
    };

    self.saveFeatureLists = function (form) {
        var invalid = [];
        var valid = [];

        angular.forEach(self.newFeatureLists, function (featureLists) {
            if (featureLists.list) {
                if (featureLists.list.dataResourceUid) {
                    valid.push(featureLists.list.dataResourceUid);
                } else {
                    invalid.push(featureLists);
                }
            }
        });

        if (invalid.length == 0) {
            self.newFeatureLists = [];
            if (valid.length > 0) {
                angular.forEach(valid, function (record) {
                    self.opus.featureLists.push(record);
                });
            }
            self.saveOpus(form);
        } else if (invalid.length > 0) {
            messageService.alert(invalid.length + " list" + (invalid.length > 1 ? "s are" : " is") + " not valid. You must select items from the list.")
        }
    };

    self.removeFeatureList = function (index, list, form) {
        if (list == 'existing') {
            self.opus.featureLists.splice(index, 1);
        } else {
            self.newFeatureLists.splice(index, 1);
        }
        form.$setDirty();
    };

    self.opusResourceChanged = function ($item) {
        self.opus.dataResourceUid = $item.id;

        loadDataResource(self.opus.dataResourceUid);
    };

    self.resetRecordSources = function () {
        self.opus.dataResourceConfig.recordResourceOption = self.originalRecordResourceOption;
        if (!_.isUndefined(self.recordResourceMultiSelectOptions)) {
            self.recordResourceMultiSelectOptions.selectedItems.length = 0;
        }
        if (!_.isUndefined(self.recordHubMultiSelectOptions)) {
            self.recordHubMultiSelectOptions.selectedItems.length = 0;
        }
        self.recordHubMultiSelectOptions.items.length = 0;
        self.recordResourceMultiSelectOptions.items.length = 0;
        self.recordSourceOptionChanged();
    };

    self.recordSourceOptionChanged = function () {
        if (!_.isUndefined(self.recordResourceMultiSelectOptions)) {
            Array.prototype.push.apply(self.recordResourceMultiSelectOptions.items, self.recordResourceMultiSelectOptions.selectedItems);
            self.recordResourceMultiSelectOptions.selectedItems.length = 0;
        }
        if (!_.isUndefined(self.recordHubMultiSelectOptions)) {
            Array.prototype.push.apply(self.recordHubMultiSelectOptions.items, self.recordHubMultiSelectOptions.selectedItems);
            self.recordHubMultiSelectOptions.selectedItems.length = 0;
        }

        if (self.opus.dataResourceConfig.recordResourceOption == "HUBS") {
            if (self.recordHubMultiSelectOptions.items.length == 0) {
                loadRecordHubs();
            }
        } else if (self.opus.dataResourceConfig.recordResourceOption == "RESOURCES") {
            if (self.recordResourceMultiSelectOptions.items.length == 0) {
                loadRecordResources();
            }
        }
    };

    self.resetImageSources = function () {
        self.opus.dataResourceConfig.imageResourceOption = self.originalImageResourceOption;
        if (!_.isUndefined(self.imageResourceMultiSelectOptions)) {
            self.imageResourceMultiSelectOptions.selectedItems.length = 0;
        }
        if (!_.isUndefined(self.imageHubMultiSelectOptions)) {
            self.imageHubMultiSelectOptions.selectedItems.length = 0;
        }
        self.imageHubMultiSelectOptions.items.length = 0;
        self.imageResourceMultiSelectOptions.items.length = 0;
        self.imageSourceOptionChanged();
    };

    self.imageSourceOptionChanged = function () {
        if (!_.isUndefined(self.imageResourceMultiSelectOptions)) {
            Array.prototype.push.apply(self.imageResourceMultiSelectOptions.items, self.imageResourceMultiSelectOptions.selectedItems);
            self.imageResourceMultiSelectOptions.selectedItems.length = 0;
        }
        if (!_.isUndefined(self.imageHubMultiSelectOptions)) {
            Array.prototype.push.apply(self.imageHubMultiSelectOptions.items, self.imageHubMultiSelectOptions.selectedItems);
            self.imageHubMultiSelectOptions.selectedItems.length = 0;
        }

        if (self.opus.dataResourceConfig.imageResourceOption == "HUBS") {
            if (self.imageHubMultiSelectOptions.items.length == 0) {
                loadImageHubs();
            }
        } else if (self.opus.dataResourceConfig.imageResourceOption == "RESOURCES") {
            if (self.imageResourceMultiSelectOptions.items.length == 0) {
                loadImageResources();
            }
        }
    };

    self.deleteOpus = function () {
        var deleteConf = util.confirm("Are you sure you wish to delete this entire collection? This operation cannot be undone.");
        deleteConf.then(function () {
            var promise = profileService.deleteOpus(self.opus.uuid);
            promise.then(function () {
                    util.redirect(util.contextRoot() + "/");
                },
                function () {
                    messageService.alert("An error occurred while deleting the collection.")
                });
        });
    };

    self.showShortNameTip = function () {
        self.shortNameTipVisible = true;
    };

    self.opusBannerUploaded = function (result) {
        self.opus.brandingConfig.opusBannerUrl = util.getBaseHref() + result.imageUrl;
        self.toggleUploadPanel('opusBanner');
        self.StyleForm.$setDirty();
    };

    self.profileBannerUploaded = function (result) {
        self.opus.brandingConfig.profileBannerUrl = util.getBaseHref() + result.imageUrl;
        self.toggleUploadPanel('profileBanner');
        self.StyleForm.$setDirty();
    };

    self.pdfBannerUploaded = function(result) {
        self.opus.brandingConfig.pdfBannerUrl = util.getBaseHref() + result.imageUrl;
        self.toggleUploadPanel('pdfBanner');
        self.StyleForm.$setDirty();
    };

    self.pdfBackBannerUploaded = function(result) {
        self.opus.brandingConfig.pdfBackBannerUrl = util.getBaseHref() + result.imageUrl;
        self.toggleUploadPanel('pdfBackBanner');
        self.StyleForm.$setDirty();
    };

    self.addAnEmptyLogo = function () {
        var logo = {
                logoUrl: undefined,
                hyperlink: undefined
            };

        self.opus.brandingConfig.logos.push(logo);
    };

    self.logoUploaded = function (result) {
        var logoUrl = util.getBaseHref() + result.imageUrl,
            logo = {
                logoUrl: logoUrl,
                hyperlink: undefined
            };

        self.opus.brandingConfig.logos.push(logo);
        self.toggleUploadPanel('logo');
        self.StyleForm.$setDirty();
    };

    self.generateFileUploadUrl = function () {
        return self.imageUploadUrl + util.getRandomString();
    };

    self.addAnEmptyImage = function () {
        var image = {
            imageUrl: undefined,
            credit: undefined
        };

        self.opus.opusLayoutConfig.images.push(image);
    };

    self.imageUploaded = function (result) {
        var imageUrl = util.getBaseHref() + result.imageUrl,
            image = {
                imageUrl: imageUrl,
                credit: undefined
            };

        self.opus.opusLayoutConfig.images.push(image);
        self.toggleUploadPanel('imageSlider');
        self.LandingPage.$setDirty();
    };

    self.removeItem = function ($index, list, form) {
        if (list.length) {
            list.splice($index,1);
            form.$setDirty();
        }
    };

    self.move = function(index, list, form, dir) {
        var newIndex = index + dir;
        if (!self.rangeCheck(list, index) || !self.rangeCheck(list, newIndex) || !list) return;
        var original = list[index];
        list[index] = list[newIndex];
        list[newIndex] = original;
        form.$setDirty();
    };

    self.rangeCheck = function (list, index) {
        return (index < list.length)  && (index >= 0);
    };

    self.thumbnailUploaded = function (result) {
        self.opus.brandingConfig.thumbnailUrl = util.getBaseHref() + result.imageUrl;
        self.toggleUploadPanel('thumbnail');
        self.StyleForm.$setDirty();
    };

    self.toggleUploadPanel = function (section) {
        self.showUpload[section] = !self.showUpload[section];
    };

    self.masterListKeybaseItemsLoading = false;
    self.masterListKeybaseItemsLoaded = false;
    self.masterListKeybaseItems = null;

    // Disable this feature to remove filter for keys https://github.com/AtlasOfLivingAustralia/profile-hub/issues/514
    self.canInitialiseKeyplayer = function() {
        return true;
    /*        if (self.masterListKeybaseItems !== null || self.masterListKeybaseItemsLoaded) return true;
        if (!self.opus) return false;
        if (!self.masterListKeybaseItemsLoading) {
            self.masterListKeybaseItemsLoading = true;
            profileService.loadMasterListItems(self.opus).then(function(results) {
                self.masterListKeybaseItems = results;
                self.masterListKeybaseItemsLoaded = true;
            }, function(error) {
                $log.error("Failed to load master list items", error);
                var msg;
                if (self.opus.title.toLowerCase().indexOf('australia') !== -1 && Math.random() >= 0.9) {
                    msg = "Strewth mate, the master list is deadset cactus";
                } else {
                    msg = "Could not load master list."
                }
                messageService.alertStayOn(msg);
            });
        }
        return false; */
    };

    // Support for lazy loading the keyplayer.
    self.initialiseKeyplayer = function () {
        if (self.keybaseTemplateUrl != 'keyplayer.html') {
            self.keybaseTemplateUrl = 'keyplayer.html';
        }
    };

    self.isRecordSourceSelectionValid = function () {
        var valid = false;

        if (self.opus && self.opus.dataResourceConfig && self.recordHubMultiSelectOptions) {
            if (self.opus.usePrivateRecordData) {
                valid = true;
            } else if (self.opus.dataResourceConfig.recordResourceOption == "HUBS") {
                valid = self.recordHubMultiSelectOptions.selectedItems.length != 0
            } else if (self.opus.dataResourceConfig.recordResourceOption == "RESOURCES") {
                valid = self.recordResourceMultiSelectOptions.selectedItems.length != 0
            } else {
                valid = true;
            }
        }

        return valid;
    };

    self.isImageSourceSelectionValid = function () {
        var valid = false;

        if (self.opus && self.opus.dataResourceConfig && self.imageHubMultiSelectOptions) {
            if (self.opus.dataResourceConfig.imageResourceOption == "HUBS") {
                valid = self.imageHubMultiSelectOptions.selectedItems.length != 0
            } else if (self.opus.dataResourceConfig.imageResourceOption == "RESOURCES") {
                valid = self.imageResourceMultiSelectOptions.selectedItems.length != 0
            } else {
                valid = true;
            }
        }

        return valid;
    };

    self.tagSelected = function(form) {
        if (!self.opus.tags) {
            self.opus.tags = [];
        }
        self.opus.tags.push(self.selectedTag);
        self.tags.splice(self.tags.indexOf(self.selectedTag), 1);
        self.selectedTag = null;
        form.$setDirty();
    };

    self.removeTag = function(tag, form) {
        self.tags.push(tag);
        self.opus.tags.splice(self.opus.tags.indexOf(tag), 1);
        form.$setDirty();
    };



    function loadKeybaseProjects() {
        profileService.retrieveKeybaseProjects().then(function (data) {
            self.keybaseProjects = data;

            if (self.opus && self.opus.keybaseProjectId) {
                setSelectedKeybaseProject();
            }
        });
    }

    function setSelectedKeybaseProject() {
        angular.forEach(self.keybaseProjects, function (project) {
            if (project.project_id == self.opus.keybaseProjectId) {
                self.selectedKeybaseProject = project;
            }
        });
    }

    function toggleMapPointerColourHash(shouldExist) {
        if (self.opus.mapConfig && self.opus.mapConfig.mapPointColour) {
            if (!shouldExist && self.opus.mapConfig.mapPointColour.indexOf("#") > -1) {
                self.opus.mapConfig.mapPointColour = self.opus.mapConfig.mapPointColour.substr(1);
            } else if (shouldExist && self.opus.mapConfig.mapPointColour.indexOf("#") == -1) {
                self.opus.mapConfig.mapPointColour = "#" + self.opus.mapConfig.mapPointColour;
            }
        }
    }

    function watchForChanges(expression, form) {
        if (!_.isUndefined(form)) {
            $scope.$watch(expression, function (newVal, oldVal) {
                if (_.isEqual(newVal, oldVal)) {
                    form.$setPristine();
                } else {
                    form.$setDirty();
                }
            }, true)
        }
    }

    function loadOpusDataResourceList() {
        self.opusDataResourceList = [];
        var resources = profileService.listResources();
        resources.then(function(data) {
            angular.forEach(data, function (key, value) {
                self.opusDataResourceList.push({id: value, name: key.trim()});
            });
        });
    }

    function loadRecordResources() {
        var resources = profileService.listResources();
        self.recordResourceMultiSelectOptions.loading = true;
        resources.then(function (data) {
                self.recordResourceMultiSelectOptions.items.length = 0;
                self.recordResourceMultiSelectOptions.selectedItems.length = 0;
                angular.forEach(data, function (key, value) {
                    var resource = {id: value, name: key.trim()};
                    if (self.opus.dataResourceConfig.recordSources.indexOf(value) > -1) {
                        self.recordResourceMultiSelectOptions.selectedItems.push(resource);
                    } else {
                        self.recordResourceMultiSelectOptions.items.push(resource);
                    }
                });

                self.recordResourceMultiSelectOptions.loading = false;

                watchForChanges(function () {
                    return self.recordResourceMultiSelectOptions.selectedItems
                }, $scope.RecordForm);
            },
            function () {
                console.log("Failed to retrieve opus description from collectory.");
            }
        );
    }

    function loadRecordHubs() {
        var hubs = profileService.listHubs();
        self.recordHubMultiSelectOptions.loading = true;
        hubs.then(function (data) {
                self.recordHubMultiSelectOptions.items.length = 0;
                self.recordHubMultiSelectOptions.selectedItems.length = 0;
                angular.forEach(data, function (key, value) {
                    var hub = {id: value, name: key.trim()};
                    if (self.opus.dataResourceConfig.recordSources.indexOf(value) > -1) {
                        self.recordHubMultiSelectOptions.selectedItems.push(hub);
                    } else {
                        self.recordHubMultiSelectOptions.items.push(hub);
                    }
                });

                self.recordHubMultiSelectOptions.loading = false;

                watchForChanges(function () {
                    return self.recordHubMultiSelectOptions.selectedItems
                }, $scope.RecordForm);
            },
            function () {
                console.log("Failed to retrieve opus description from collectory.");
            }
        );
    }

    function loadImageResources() {
        var resources = profileService.listResources();
        self.imageResourceMultiSelectOptions.loading = true;
        resources.then(function (data) {
                self.imageResourceMultiSelectOptions.items.length = 0;
                self.imageResourceMultiSelectOptions.selectedItems.length = 0;
                angular.forEach(data, function (key, value) {
                    var resource = {id: value, name: key.trim()};
                    if (self.opus.dataResourceConfig.imageSources.indexOf(value) > -1) {
                        self.imageResourceMultiSelectOptions.selectedItems.push(resource);
                    } else {
                        self.imageResourceMultiSelectOptions.items.push(resource);
                    }
                });

                self.imageResourceMultiSelectOptions.loading = false;

                watchForChanges(function () {
                    return self.imageResourceMultiSelectOptions.selectedItems
                }, $scope.ImageForm);
            },
            function () {
                console.log("Failed to retrieve opus description from collectory.");
            }
        );
    }

    function loadImageHubs() {
        var hubs = profileService.listHubs();
        self.imageHubMultiSelectOptions.loading = true;
        hubs.then(function (data) {
                self.imageHubMultiSelectOptions.items.length = 0;
                self.imageHubMultiSelectOptions.selectedItems.length = 0;
                angular.forEach(data, function (key, value) {
                    var hub = {id: value, name: key.trim()};
                    if (self.opus.dataResourceConfig.imageSources.indexOf(value) > -1) {
                        self.imageHubMultiSelectOptions.selectedItems.push(hub);
                    } else {
                        self.imageHubMultiSelectOptions.items.push(hub);
                    }
                });

                self.imageHubMultiSelectOptions.loading = false;

                watchForChanges(function () {
                    return self.imageHubMultiSelectOptions.selectedItems
                }, $scope.ImageForm);
            },
            function () {
                console.log("Failed to retrieve opus description from collectory.");
            }
        );
    }

    function loadSpeciesLists() {
        var lists = profileService.getAllLists();
        lists.then(function (data) {
            self.allSpeciesLists = [];
            angular.forEach(data.lists, function (list) {
                self.allSpeciesLists.push({dataResourceUid: list.dataResourceUid, listName: list.title.trim()});
            });
            self.allSpeciesLists = orderBy(self.allSpeciesLists, "listName");
        });
    }

    function loadDataResource(dataResourceId) {
        var promise = profileService.getResource(dataResourceId);
        promise.then(function (data) {
                self.dataResource = data;
            },
            function () {
                console.log("Failed to retrieve opus description from collectory.");
            }
        );
    }

    function loadOpusList() {
        var promise = profileService.listOpus();
        promise.then(function (data) {
            angular.forEach(data, function (opus) {
                self.opusList.push({
                    uuid: opus.uuid,
                    title: opus.title,
                    thumbnailUrl: opus.brandingConfig.thumbnailUrl,
                    shortName: opus.shortName,
                    pubDescription: opus.pubDescription
                })
            });
        })
    }

    function loadTags() {
        profileService.getTags().then(function(data) {
            self.tags = data.tags;

            removeSelectedTags();
        });
    }

    function removeSelectedTags() {
        if (self.opus && self.opus.tags) {
            if (!self.tags) {
                self.tags = [];
            }
            self.opus.tags.forEach (function (tag) {
                var t = _.find(self.tags, function (t) { return t.uuid == tag.uuid });
                self.tags.splice(self.tags.indexOf(t), 1);
            });
        }
    }
});

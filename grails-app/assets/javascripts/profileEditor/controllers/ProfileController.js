/**
 * Profile controller
 */
profileEditor.controller('ProfileController',
    ['profileService', 'profileComparisonService', 'util', 'messageService', 'navService', 'config', '$modal', '$window', '$filter', '$sce', '$location', '$scope', '$timeout',
        function (profileService, profileComparisonService, util, messageService, navService, config, $modal, $window, $filter, $sce, $location, $scope, $timeout) {
    var self = this;

    self.profile = null;
    self.profileId = util.getEntityId("profile");
    self.opus = null;
    self.readonly = true;
    self.hasKeybaseKey = false;

    self.showMap = true;

    self.opusId = util.getEntityId("opus");

    self.showNameEditControls = false;
    self.showFormatNameControls = false;
    self.autoFormatProfileName = true;
    self.formattedNameText = '';
    self.manuallyMatchedGuid = "";

    self.audit = {
        pageSize: 20,
        data: [],
        total: 0,
        page:1
    };

    self.acknowledgementsSectionTitle = config.readonly ? 'Acknowledgements' : 'Authors and Acknowledgements';

    self.bibliographyDirty = false;

    self.manualHierarchy = [];

    var orderBy = $filter("orderBy");

    self.readonly = function () {
        return config.readonly
    };

    self.isDirty = function () {
        return self.bibliographyDirty;
    };

    self.loadProfile = function () {
        if (self.profileId) {
            var promise = profileService.getProfile(self.opusId, self.profileId);
            promise.then(function (data) {
                    self.profile = data.profile;
                    self.profileId = data.profile.uuid;
                    self.opus = data.opus;
                   // self.autoFormatName = data.profile.

                    self.nslUrl = $sce.trustAsResourceUrl(config.nslNameUrl + self.profile.nslNameIdentifier + ".html");

                    $window.document.title = self.profile.scientificName + " | " + self.opus.title;

                    self.primaryVideo = self.profile.primaryVideo ? _.find(self.profile.documents, function(doc) { return doc.documentId == self.profile.primaryVideo }) : null;
                    self.primaryAudio = self.profile.primaryAudio ? _.find(self.profile.documents, function(doc) { return doc.documentId == self.profile.primaryAudio }) : null;

                    if (self.opus.keybaseProjectId) {
                        var keyPromise = profileService.findKeybaseKeyForName(self.opus.uuid, self.profile.scientificName);
                        keyPromise.then(function (data) {
                            if (data && data.keyId) {
                                self.hasKeybaseKey = true;
                                // The key player needs to be manually registered with the navigation service as
                                // it needs to be lazily loaded.
                                navService.add("Key", "key", undefined, 'Key');
                            }
                        });
                    }

                    self.authorshipCount = 0;
                    angular.forEach(self.profile.authorship, function (auth) {
                        if (auth.text && auth.text.length > 0) {
                            self.authorshipCount++;
                        }
                    });

                    loadVocabulary();
                    loadNslNameDetails();

                    self.autoFormatProfileName = self.profile.profileSettings ? self.profile.profileSettings['autoFormatProfileName']  : true;

                    self.formattedNameText = util.formatScientificName(self.profile.scientificName, self.profile.nameAuthor, self.profile.fullName, self.profile.profileSettings);

                    if (self.profile.matchedName) {
                          self.profile.matchedName.formattedName = util.formatScientificName(self.profile.matchedName.scientificName, self.profile.matchedName.nameAuthor, self.profile.matchedName.fullName);
                    }

                    self.constructManualHierarchyForNameDirective();

                    // Load the other tabs content in the background.  If we leave them fully lazy loaded then
                    // registering them with the navigation service needs to be done manually.
                    $timeout(function() {
                        navService.initialiseTabs();
                    }, 0);
                },
                function () {
                    messageService.alert("An error occurred while loading the profile.");
                }
            );
        }
    };

    self.constructManualHierarchyForNameDirective = function() {
        if (!self.readonly() && self.profile.manualClassification) {
            self.manualHierarchy = [];

            // The name check directive deals with the hierarchy from the BOTTOM UP, but we store it TOP DOWN, so reverse it
            var tempClassification = _.clone(self.profile.classification);
            tempClassification.reverse();

            var firstKnownEntityFound = false;
            tempClassification.forEach(function (item, index) {
                // we want the first item, then all items up to and including the FIRST one with a guid or profileId
                var doesNotHaveId = !item.guid && !item.profileId;
                if ((doesNotHaveId && !firstKnownEntityFound) || !firstKnownEntityFound || index == 0) {
                    self.manualHierarchy.push({
                        name: item.profileName || item.name,
                        guid: item.profileId || item.guid,
                        rank: item.rank,
                        checked: true
                    });
                }

                if (index > 0 && !firstKnownEntityFound && !doesNotHaveId) {
                    firstKnownEntityFound = true;
                }
            });

            // only 1 item in the hierarchy can have a guid, as that indicates a match to a known entity (either a profile
            // or a Name) which will have a defined classification: meaning that the user can define a custom classification
            // UP TO the point where they join a known tree - they cannot change anything above that point.
            // So, if we leave the first item (i.e. the current profile) with a guid (profileId), then user will not be able
            // to modify the hierarchy.
            self.manualHierarchy[0].guid = null;
        } else {
            self.manualHierarchy = [];
        }
    };

    function loadNslNameDetails() {
        if (self.profile.nslNameIdentifier) {
            var nslPromise = profileService.getNslNameDetails(self.profile.nslNameIdentifier);
            nslPromise.then(function (data) {
                self.nslNameStatus = data.status;
                if (!_.isUndefined(data.primaryInstance) && data.primaryInstance && data.primaryInstance.length > 0) {

                    self.nslProtologue = data.primaryInstance[0].citationHtml;
                    if (data.primaryInstance[0].page) {
                        self.nslProtologue += ": " + data.primaryInstance[0].page;
                    }
                }
            });
        }
    }

    function loadVocabulary() {
        if (self.opus.attributeVocabUuid != null) {
            var vocabPromise = profileService.getOpusVocabulary(self.opusId, self.opus.authorshipVocabUuid);
            vocabPromise.then(function (data) {
                self.authorVocab = data.terms;

                self.authorVocabStrict = data.strict;

                var authorCategories = [];
                angular.forEach(self.profile.authorship, function (author) {
                    if (authorCategories.indexOf(author.category) == -1) {
                        authorCategories.push(author.category);
                    }
                });

                angular.forEach(self.authorVocab, function (term) {
                    if (authorCategories.indexOf(term.name) == -1) {
                        self.profile.authorship.push({category: term.name, text: null});
                    }
                });
            });
        }
    }

    self.deleteProfile = function () {
        var deleteConf = util.confirm("Are you sure you wish to delete this profile? This operation cannot be undone.");
        deleteConf.then(function () {
            var promise = profileService.deleteProfile(self.opus.uuid, self.profileId);
            promise.then(function () {
                    util.redirect(util.contextRoot() + "/opus/" + self.opus.uuid);
                },
                function () {
                    messageService.alert("An error occurred while deleting the profile.");
                });
        });
    };

    self.createProfile = function (opusId, duplicateExisting) {
        var popup = $modal.open({
            templateUrl: "/profileEditor/createProfile.htm",
            controller: "CreateProfileController",
            controllerAs: "createProfileCtrl",
            size: "md",
            resolve: {
                opusId: function () {
                    return opusId;
                },
                duplicateExisting: function() {
                    return duplicateExisting;
                }
            }
        });

        popup.result.then(function (profile) {
            messageService.success("Profile for " + profile.scientificName + " has been successfully created.");
            util.redirect(util.contextRoot() + "/opus/" + self.opusId + "/profile/" + profile.scientificName + "/update");
        });
    };

    self.addBibliography = function (form) {
        if (!self.profile.bibliography) {
            self.profile.bibliography = [];
        }
        self.profile.bibliography.push({text: "", order: self.profile.bibliography.length, edit: true});

        self.bibliographyDirty = true;
        form.$setDirty();
    };
            
    self.editBibliography = function (index, form) {
        self.profile.bibliography[index].edit = true;

        self.bibliographyDirty = true;
        form.$setDirty();
    };

    self.deleteBibliography = function (index, form) {
        var deletedItemOrder = self.profile.bibliography[index].order;
        self.profile.bibliography.splice(index, 1);

        angular.forEach(self.profile.bibliography, function (bib) {
            if (bib.order > deletedItemOrder) {
                bib.order = bib.order - 1;
            }
        });

        self.bibliographyDirty = true;
        form.$setDirty();
    };

    self.moveBibliographyUp = function (index, form) {
        if (index > 0) {
            self.profile.bibliography[index].order = index - 1;
            self.profile.bibliography[index - 1].order = index;

            self.profile.bibliography = orderBy(self.profile.bibliography, "order");

            self.bibliographyDirty = true;
            form.$setDirty();
        }
    };

    self.moveBibliographyDown = function (index, form) {
        if (index < self.profile.bibliography.length) {
            self.profile.bibliography[index].order = index + 1;
            self.profile.bibliography[index + 1].order = index;

            self.profile.bibliography = orderBy(self.profile.bibliography, "order");

            self.bibliographyDirty = true;
            form.$setDirty();
        }
    };

    self.toggleDraftMode = function () {
        if (self.profile.privateMode && config.features.publications !== 'false') {
            var confirm = util.confirm("Would you like to take a snapshot of the current public version before releasing your changes?", "Yes", "No");

            confirm.then(function () {
                toggleDraftMode(true);
            }, function () {
                toggleDraftMode(false);
            });
        } else {
            toggleDraftMode(false);
        }
    };

    function toggleDraftMode(snapshot) {
        if (self.profile.privateMode && snapshot) {
            messageService.info("Creating snapshot and applying changes. Please wait...");
        } else if (self.profile.privateMode && !snapshot) {
            messageService.info("Applying changes. Please wait...");
        }

        var future = profileService.toggleDraftMode(self.opusId, self.profileId, snapshot, self.profile.privateMode);

        future.then(function () {
            messageService.success("The profile has been successfully updated.");

            // the name may have been changed in the draft, so the url parameter may no longer be correct. Update the profileId to ensure we load the correct name.
            self.profileId = self.profile.scientificName;

            self.loadProfile();
        }, function () {
            messageService.alert("An error has occurred while updating the profile.");
        });
    }

    self.discardDraftChanges = function () {
        var confirm = util.confirm("Are you sure you wish to discard all draft changes? This operation cannot be undone.");
        confirm.then(function () {
            var future = profileService.discardDraftChanges(self.opusId, self.profileId);

            future.then(function () {
                messageService.success("The profile has been successfully restored.");

                util.redirect($location.absUrl());
            }, function () {
                messageService.alert("An error has occurred while restoring the profile.");
            });
        })
    };

    self.saveProfile = function (form) {
        var future = profileService.updateProfile(self.opusId, self.profileId, self.profile);

        future.then(function (data) {
            messageService.success("The profile has been successfully updated.");

            self.profile = data;

            self.bibliographyDirty = false;
            if (form) {
                form.$setPristine();
            }
        }, function () {
            messageService.alert("An error has occurred while updating the profile.");
        });
    };

    self.addAuthorship = function (form) {
        if (!self.profile.authorship || self.profile.authorship.length == 0) {
            self.profile.authorship = [{category: "Author", text: ""}];
        } else {
            self.profile.authorship.push({category: "", text: ""});
        }

        form.$setDirty();
    };

    self.saveAuthorship = function (form) {
        for (var i = self.profile.authorship.length - 1; i >= 0; i--) {
            if (!self.profile.authorship[i].text) {
                self.profile.authorship.splice(i, 1);
            }
        }

        var future = profileService.saveAuthorship(self.opusId, self.profileId, {authorship: self.profile.authorship});

        future.then(function () {
            form.$setPristine();

            messageService.success("Acknowledgements successfully updated.");
        }, function () {
            messageService.alert("An error occurred while updating acknowledgements.");
        })
    };

    self.deleteAuthorship = function (index, form) {
        self.profile.authorship.splice(index, 1);

        form.$setDirty();
    };

    self.formatName = function () {
        if (!self.profile) {
            return null;
        }

        if (self.profile.matchedName && self.profile.scientificName == self.profile.matchedName.scientificName) {
            return util.formatScientificName(self.profile.scientificName, self.profile.nameAuthor, self.profile.fullName, self.profile.profileSettings);
        } else {
            return util.formatScientificName(self.profile.scientificName, self.profile.nameAuthor, null, self.profile.profileSettings);
        }
    };

    self.editName = function () {
        self.showNameEditControls = !self.showNameEditControls;
        self.newName = self.profile.scientificName;
    };

    self.formatNameEdit = function (form) {

        if (form && form.$dirty) {
            var confirm = util.confirm("Do you wish to save and apply changes to Manual Formatting?");
            confirm.then(function () {
                self.saveProfileSettings (form);
                self.showFormatNameControls = !self.showFormatNameControls;
             });

        } else {
            self.showFormatNameControls = !self.showFormatNameControls;
        }
    };


   self.toggleFormatName = function (changeToAuto, form) {

       // Need this in case the function is triggered from the Cancel Manual Formatting button
       if (changeToAuto) {
           self.autoFormatProfileName = true;
       } else {
           self.showFormatNameControls = true;
       }

       if (changeToAuto && self.formattedNameText) {
           var confirm = util.confirm("Do you wish switch to Auto Name Format? You will lose the changes any changes that you made for Manual Name Formatting.");
           confirm.then(function () {
               self.formattedNameText = '';
               self.saveProfileSettings (form);
               self.showFormatNameControls = false;
           }, function() {
               self.autoFormatProfileName = !self.autoFormatProfileName;
           });

       }
    };

   self.saveProfileSettings = function (form) {

       var profileName = self.profile.fullName? self.profile.fullName: self.profile.scientificName + " " + self.profile.nameAuthor;

       if (self.autoFormatProfileName || (self.formattedNameText && self.formattedNameText.replace(/(<([^>]+)>)/ig,"") == profileName)) {

        self.profileSettings = {};
        self.profileSettings['autoFormatProfileName'] = self.autoFormatProfileName;
        self.profileSettings['formattedNameText'] = self.formattedNameText;

        profileService.updateProfile(self.opusId, self.profileId, {profileSettings:self.profileSettings}).then(
            function() {
                form.$setPristine();
                self.formattedNameText = util.formatScientificName(self.profile.scientificName, self.profile.nameAuthor, self.profile.fullName, self.profileSettings);
            },
            function() {
                messageService.alert("An error has occurred while updating the Profile setting.");
            }
        );
       } else if (!self.formattedNameText) {
           messageService.alert("Please make sure that formatted text is not empty for Manual Format mode.");
       } else {
           messageService.alert("You cannot change the profile name using this function. Please use Edit Name functionality for that.");
       }
    };

   self.saveNameChange = function () {
        var confirm = util.confirm("Are you sure you wish to rename this profile?");

        confirm.then(function () {
            var future = profileService.renameProfile(self.opusId, self.profileId, {
                newName: self.newName,
                manuallyMatchedGuid: self.manuallyMatchedGuid,
                clearMatch: false,
                manualHierarchy: self.manualHierarchy
            });

            future.then(function (profile) {
                self.profile = profile;

                messageService.success("The profile name has been successfully updated.");

                self.autoFormatProfileName = true;
                self.formattedNameText = '';
                self.saveProfileSettings();

                util.redirect(util.contextRoot() + "/opus/" + self.opusId + "/profile/" + profile.scientificName + "/update");
            }, function () {
                messageService.alert("An error occurred while updating the profile name.");
            });
        });
    };

    self.clearNameMatch = function () {
        var confirm = util.confirm("Are you sure you wish to remove the matched name from this profile? This will mean that information from Atlas of Living Australia resources will not be available.");

        confirm.then(function () {
            var future = profileService.renameProfile(self.opusId, self.profileId, {newName: null, clearMatch: true});

            future.then(function (profile) {
                self.profile = profile;

                messageService.success("The profile name has been successfully updated.");

                util.redirect(util.contextRoot() + "/opus/" + self.opusId + "/profile/" + profile.scientificName + "/update");
            }, function () {
                messageService.alert("An error occurred while updating the profile name.");
            });
        });
    };

    self.toggleAudit = function () {
        self.showProfileAudit = !self.showProfileAudit;

        if (self.showProfileAudit) {
            self.loadAuditData();
        }
    };

    self.loadAuditData = function() {
        self.loading = true;
        // Always get one more profile than the page size so the last comparison can be performed.
        var future = profileService.getAuditHistory(self.profileId, self.audit.pageSize * (self.audit.page-1), self.audit.pageSize+1);
        future.then(function (data) {
            self.audit.total = data.total;
            self.audit.data = self.filterAuditData(data.items);
            self.loading = false;
        }, function () {
            messageService.alert("An error occurred while retrieving the audit history");
        });
    };

    self.filterAuditData = function(data) {
        var auditData = [];

        for (var i=0; i<data.length-1; i++) {
            var diff = profileComparisonService.compareProfiles(data[i].object, data[i+1].object);
            if (diff.changed) {
                auditData.push({left:data[i], right:data[i+1]});
            }
        }
        if (data.length <= self.audit.pageSize) {
            auditData.push({left:data[data.length-1], right:null});
        }
        return auditData;
    };

    self.showAuditComparison = function (auditItem) {
        $modal.open({
            templateUrl: "/profileEditor/auditComparisonPopup.htm",
            controller: "ComparisonPopupController",
            controllerAs: "compareCtrl",
            size: "lg",
            resolve: {
                left: function () {
                    return auditItem.left;
                },
                right: function () {
                    return auditItem.right;
                }
            }
        });
    };

    self.compareWithOtherProfile = function () {
        $modal.open({
            templateUrl: "/profileEditor/profileComparisonPopup.htm",
            controller: "ComparisonPopupController",
            controllerAs: "compareCtrl",
            size: "lg",
            resolve: {
                left: function () {
                    return self.profile;
                },
                right: function () {
                    return null;
                }
            }
        });
    };

    self.archiveProfile = function () {
        var popup = $modal.open({
            templateUrl: "/profileEditor/archiveProfilePopup.htm",
            controller: "ArchiveProfileController",
            controllerAs: "archiveCtrl",
            size: "md"
        });

        popup.result.then(function (archiveComment) {
            var promise = profileService.archiveProfile(self.opusId, self.profileId, archiveComment);

            promise.then(function () {
                util.redirect(util.contextRoot() + "/opus/" + (self.opus.shortName ? self.opus.shortName : self.opus.uuid) + "/profile/" + self.profile.uuid);
                messageService.success("Your profile has been successfully archived.")
            }, function () {
                messageService.alert("An error occurred while archiving the profile.");
            });
        });
    };

    self.restoreProfile = function () {
        var search = profileService.profileSearch(self.opusId, self.profile.archivedWithName, false);

        search.then(function (results) {
            if (!results || results.length == 0 || (results.length == 1 && results[0].profileId == self.profile.uuid)) {
                var confirm = util.confirm("Are you sure you wish to restore this profile?");
                confirm.then(function () {
                    restoreProfile(null);
                })
            } else {
                var popup = $modal.open({
                    templateUrl: "/profileEditor/restoreProfilePopup.htm",
                    controller: "RestoreProfileController",
                    controllerAs: "restoreCtrl",
                    size: "md",
                    resolve: {
                        profileId: function () {
                            return self.profile.uuid;
                        }
                    }
                });

                popup.result.then(function (newName) {
                    restoreProfile(newName);
                });
            }
        });
    };

    self.isArchived = function () {
        return self.profile && self.profile.archivedDate != null;
    };

    function restoreProfile(newName) {
        var restore = profileService.restoreArchivedProfile(self.opusId, self.profile.uuid, newName ? newName : null);

        restore.then(function (updatedProfile) {
            util.redirect(util.contextRoot() + "/opus/" + (self.opus.shortName ? self.opus.shortName : self.opus.uuid) + "/profile/" + updatedProfile.scientificName);
        }, function () {
            messageService.alert("An error has occurred while restoring your profile.");
        });
    }

    // Support for lazy loading the keyplayer.
    self.keybaseTemplateUrl = undefined;
    self.masterListKeybaseItemsLoading = false;
    self.masterListKeybaseItemsLoaded = false;
    self.masterListKeybaseItems = null;

    // Disable this feature to remove filter for keys https://github.com/AtlasOfLivingAustralia/profile-hub/issues/514
    self.canInitialiseKeyplayer = function() {
        return true;
/*        if (self.masterListKeybaseItems !== null || self.masterListKeybaseItemsLoaded) return true;
        if (!self.opus) return false;
        // if (!self.opus.masterListUid) return true;
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
                    msg = "Could not load master list.";
                }
                messageService.alertStayOn(msg);
            });
        }
        return false; */
    };
    self.initialiseKeyplayer = function() {
        self.keybaseTemplateUrl = 'keyplayer.html';
    };
}]);

/**
 * Controller for comparing profiles (to other profiles or to revision history entries)
 */
profileEditor.controller('ComparisonPopupController', function ($modalInstance, util, left, right, profileService) {
    var self = this;

    self.left = left;
    self.right = right;
    self.opusId = util.getEntityId("opus");

    self.selectProfile = function (profile) {
        self.right = null;
        self.loading = true;
        var future = profileService.getProfile(self.opusId, profile.profileId);
        future.then(function (data) {
            self.right = data.profile;
            self.loading = false;
        });
    };

    self.close = function () {
        $modalInstance.dismiss("Cancelled");
    };

    self.search = function (searchTerm) {
        return profileService.profileSearch(self.opusId, searchTerm, true).then(function (data) {
                return data;
            }
        );
    };

});

/**
 * Controller for archiving a profile
 */
profileEditor.controller('ArchiveProfileController', function ($modalInstance) {
    var self = this;

    self.archiveComment = null;

    self.cancel = function () {
        $modalInstance.dismiss("Cancelled");
    };

    self.ok = function () {
        $modalInstance.close(self.archiveComment);
    }

});

/**
 * Controller for restoring a profile
 */
profileEditor.controller('RestoreProfileController', function ($modalInstance, profileId) {
    var self = this;

    self.newName = null;
    self.manuallyMatchedGuid = "";
    self.profileId = profileId;

    self.cancel = function () {
        $modalInstance.dismiss("Cancelled");
    };

    self.ok = function () {
        $modalInstance.close(self.newName);
    }

});
/**
 * Angular service for interacting with the profile service application
 */
profileEditor.service('profileService', function ($http, util, $cacheFactory, config, $log) {

    function clearCache() {
        $log.debug("Clearing $http cache");
        var httpCache = $cacheFactory.get('$http');
        httpCache.removeAll();
    }

    var currentPromise;

    /**
     * Shared instance of the profile that will be returned by all methods that return a profile object.
     * This is to support notification of changes between controllers.
     */
    var sharedProfile = function() {

        var otherNames = [];

        function isName(attribute) {
            return util.isNameAttribute(attribute);
        }

        function updateNames(attributes) {
            otherNames.splice(0, otherNames.length);
            angular.forEach(attributes, function (attribute) {
                if (isName(attribute)) {
                    otherNames.push(attribute.plainText);
                    attribute.matchedAsName = true;
                } else {
                    attribute.matchedAsName = false;
                }
            });
        }

        return {
            otherNames:otherNames,
            update:function(profileData) {
                if (profileData) {
                    angular.extend(this, profileData);
                    updateNames(profileData.attributes);
                }
            }
        }

    }();

    /**
     * Chain http requests (recommended for POST, PUT & DELETE) together so they execute sequentially.
     *
     * This is necessary in any case where they may be a race condition on updating data: i.e. if two POSTs update the
     * same record, then there may be an OptimisticLockException thrown when the second request attempts to save.
     *
     * @param httpUpdateFn A function wrapping the $http service call and returning a promise
     * @returns {*} A promise that will be resolved when the execution chain reaches this request
     */
    function enqueue(httpUpdateFn) {
        if (currentPromise) {
            currentPromise = currentPromise.then(function () {
                return util.toStandardPromise(httpUpdateFn());
            });
        } else {
            currentPromise = util.toStandardPromise(httpUpdateFn());
        }

        return currentPromise;
    }

    return {

        /**
         * Loads the profile identified by the supplied opusId and profileId from the server.  If the call succeeds,
         * the returned promise will resolve with an object of the form {profile:<profile>, opus:<opus>}. The profile
         * data that is returned will be used to update a single instance of a shared profile object that all
         * consumers of this service will receive.  This instance is also updated by the updateProfile method.
         * @param opusId identifies the collection the profile is in.
         * @param profileId The id of the profile to load.
         * @returns {promise.promise|*|jQuery.promise|d.promise|promise}
         */
        getProfile : function(opusId, profileId, disableAlertOnFailure) {
            $log.debug("Fetching profile " + profileId);

            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/json", {params: {fullClassification: true}, cache: true, disableAlertOnFailure: disableAlertOnFailure});
            future = util.toStandardPromise(future);
            future.then(function(data) {
                // Only cache the profile data from the profie being viewed.  Profiles from supporting collections
                // can also be loaded if the configuration allows.
                if (util.getEntityId("opus") == opusId && util.getEntityId("profile") == profileId) {
                    // copy the content of the profile into the shared profile object to keep the object reference intact
                    sharedProfile.update(data.profile);
                    data.profile = sharedProfile;
                }
            });
            return future;
        },

        deleteProfile: function (opusId, profileId) {
            $log.debug("Deleting profile " + profileId + " from opus " + opusId);
            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/delete");
            });
            future.then(function (response) {
                $log.debug("Profile deleted with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        archiveProfile: function (opusId, profileId, archiveComment) {
            $log.debug("Archiving profile " + profileId + " from opus " + opusId);
            var future = $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/archive", {archiveComment: archiveComment});
            future.then(function (response) {
                $log.debug("Profile archived with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        restoreArchivedProfile: function (opusId, profileId, newName) {
            $log.debug("Restoring archived profile " + profileId + " from opus " + opusId);
            if (!newName) {
                newName = null;
            }

            var future = $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/restore", {newName: newName});

            future.then(function (response) {
                $log.debug("Profile restored with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        createProfile: function (opusId, scientificName, manuallyMatchedGuid, manualHierarchy) {
            $log.debug("Creating profile for " + scientificName + " in opus " + opusId);
            var future = $http.put(util.contextRoot() + "/opus/" + opusId + "/profile/create", {
                opusId: opusId,
                scientificName: scientificName,
                manuallyMatchedGuid: manuallyMatchedGuid,
                manualHierarchy: manualHierarchy
            });

            future.then(function (response) {
                $log.debug("Profile created with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        duplicateProfile: function (opusId, profileIdToCopy, scientificName, manuallyMatchedGuid, manualHierarchy) {
            $log.debug("Duplicating profile " + profileIdToCopy + " for " + scientificName + " in opus " + opusId);
            var future = $http.put(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileIdToCopy + "/duplicate", {
                opusId: opusId,
                scientificName: scientificName,
                manuallyMatchedGuid: manuallyMatchedGuid,
                manualHierarchy: manualHierarchy
            });

            future.then(function (response) {
                $log.debug("Profile duplicated with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        updateProfile: function (opusId, profileId, data) {
            $log.debug("Updating profile " + profileId);
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/update", data);
            });

            future.then(function (response) {
                clearCache();
                // copy the content of the profile into the shared profile object then return the shared profile
                // instance to it is passed to the next in the promise chain.
                sharedProfile.update(response);
                return sharedProfile;
            });
            return future;
        },

        checkName: function (opusId, scientificName) {
            $log.debug("Checking name " + scientificName);

            var future = $http.get(util.contextRoot() + "/checkName?opusId=" + opusId + "&scientificName=" + encodeURIComponent(scientificName));
            future.then(function (response) {
                $log.debug("Name checked with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        renameProfile: function (opusId, profileId, data) {
            $log.debug("Renaming profile " + profileId);

            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/rename", data);
            });
            future.then(function (response) {
                $log.debug("Profile renamed with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        toggleDraftMode: function (opusId, profileId, snapshot, publish) {
            $log.debug("Toggling draft mode for profile " + profileId);
            var future = enqueue(function () {
                var url = util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId;
                if(publish){
                    url = url + "/publishDraft?snapshot=" + snapshot;
                } else {
                    url =  url + "/createDraftMode?snapshot=" + snapshot;
                }

                return $http.post(url);
            });
            future.then(function (response) {
                $log.debug("Profile updated with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        discardDraftChanges: function (opusId, profileId) {
            $log.debug("Discarding draft changes for profile " + profileId);
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/discardDraftChanges");
            });
            future.then(function (response) {
                $log.debug("Profile updated with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        createMapSnapshot: function(opusId, profileId, occurrenceQuery, extents) {
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/map/snapshot", {occurrenceQuery: occurrenceQuery, extents: extents});
            });

            return util.toStandardPromise(future);
        },

        deleteMapSnapshot: function(opusId, profileId) {
            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/map/snapshot");
            });

            return util.toStandardPromise(future);
        },

        getOpus: function (opusId, disableAlertOnFailure) {
            $log.debug("Fetching opus " + opusId);

            if (!angular.isDefined(disableAlertOnFailure)) {
                disableAlertOnFailure = false;
            }

            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/json", {cache: true, disableAlertOnFailure: disableAlertOnFailure});
            future.then(function (response) {
                $log.debug("Opus fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getOpusAbout: function (opusId) {
            $log.debug("Fetching about page for opus " + opusId);

            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/about/json", {cache: true});
            future.then(function (response) {
                $log.debug("Opus fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        updateOpusAbout: function (opusId, aboutHtml, citationHtml) {
            $log.debug("Updating about page for opus " + opusId);

            var future = enqueue(function () {
                return $http.put(util.contextRoot() + "/opus/" + opusId + "/about/update", {
                    opusId: opusId,
                    aboutHtml: aboutHtml,
                    citationHtml: citationHtml
                });
            });
            future.then(function (response) {
                $log.debug("Opus fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        listBackupFiles: function() {
            $log.debug("Fetching backup files");
            var future = $http.get(util.contextRoot() + "/admin/listBackupFiles", {cache: true});
            future.then(function (response) {
                $log.debug("Backup file list fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);

        },

        listOpus: function () {
            $log.debug("Fetching all opuses");
            var future = $http.get(util.contextRoot() + "/opus/list", {cache: true});
            future.then(function (response) {
                $log.debug("Opus list fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        deleteOpus: function (opusId) {
            $log.debug("Deleting opus " + opusId);
            var future = $http.delete(util.contextRoot() + "/opus/" + opusId + "/delete");
            future.then(function (response) {
                $log.debug("Opus deleted with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        saveOpus: function (opusId, opus) {
            var future;
            if (opusId) {
                $log.debug("Saving opus " + opusId);
                future = enqueue(function () {
                    return $http.post(util.contextRoot() + "/opus/" + opusId + "/update", opus);
                });
            } else {
                $log.debug("Creating new opus...");
                future = enqueue(function () {
                    return $http.put(util.contextRoot() + "/opus/create", opus);
                });
            }
            future.then(function (response) {
                $log.debug("Opus saved with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        generateAccessTokenForOpus: function (opusId) {
            $log.debug("Creating access token for opus " + opusId);

            var future = enqueue(function () {
                return $http.put(util.contextRoot() + "/opus/" + opusId + "/access/token");
            });
            future.then(function (response) {
                $log.debug("Created access token with " + response.status);
            });

            return util.toStandardPromise(future);
        },

        revokeAccessTokenForOpus: function (opusId) {
            $log.debug("Revoking access token for opus " + opusId);

            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/access/token");
            });
            future.then(function (response) {
                $log.debug("Revoked access token with " + response.status);
            });

            return util.toStandardPromise(future);
        },

        updateSupportingCollections: function (opusId, supportingCollections) {
            $log.debug("Updating supporting collections for " + opusId);

            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/supportingCollections/update", supportingCollections);
            });
            future.then(function (response) {
                $log.debug("Supporting collections updated with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        respondToSupportingCollectionRequest: function (opusId, requestingOpusId, accept) {
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/supportingCollections/respond/" + requestingOpusId + "/" + accept);
            });
            future.then(function (response) {
                $log.debug("Supporting collections request responded to with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getOpusVocabulary: function (opusId, vocubularyId) {
            $log.debug("Fetching vocabulary " + vocubularyId);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/vocab/" + vocubularyId, {cache: true});
            future.then(function (response) {
                $log.debug("Vocab fetched with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future);
        },

        updateVocabulary: function (opusId, vocabularyId, data) {
            $log.debug("Updating vocabulary " + vocabularyId);
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/vocab/" + vocabularyId + "/update", data);
            });
            future.then(function (response) {
                $log.debug("Vocab updated with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        findUsagesOfVocabTerm: function (opusId, vocabularyId, termName) {
            $log.debug("Finding usages of vocab term " + termName + " from vocab " + vocabularyId);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/vocab/" + vocabularyId + "/findUsages?termName=" + termName);
            future.then(function (response) {
                $log.debug("Usages found with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        replaceUsagesOfVocabTerm: function (opusId, vocabularyId, data) {
            $log.debug("Replacing usages of vocab terms");
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/vocab/" + vocabularyId + "/replaceUsages", data);
            });
            future.then(function (response) {
                $log.debug("Terms replaced with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        updateAdditionalStatuses: function (opusId, additionalStatuses) {
            $log.debug("Updating additional statuses for " + opusId + " with " + additionalStatuses);
            var future = enqueue(function() {
                return $http.post(util.contextRoot() + '/opus/' + opusId + '/additionalStatuses', additionalStatuses, {disableAlertOnFailure: true});
            });
            return util.toStandardPromise(future);
        },

        updateMasterList: function (opusId, masterListUid) {
            $log.debug("Updating master list for " + opusId + " with " + masterListUid);
            var future = enqueue(function() {
                return $http.post(util.contextRoot() + '/opus/' + opusId + '/masterList', { masterListUid: masterListUid }, {disableAlertOnFailure: true});
            });
            return util.toStandardPromise(future);
        },

        syncMasterList: function(opusId, regen) {
            $log.debug("Syncing master list for " + opusId);
            var regenParam = regen ? 'true' : 'false';
            var future = enqueue(function() {
                return $http.post(util.contextRoot() + '/opus/' + opusId + '/masterList/sync?regenerateStubs=' + regenParam, {}, {disableAlertOnFailure: true});
            });
            return util.toStandardPromise(future);
        },

        isMasterListSyncing: function(opusId) {
            $log.debug("Checking master list sync status for " + opusId);

            var future = $http.get(util.contextRoot() + '/opus/' + opusId + '/masterList/isSyncing');
            return util.toStandardPromise(future);
        },

        updateFlorulaList: function(opusId, listId) {
            $log.debug("Updating florula list for " + opusId + " to " + listId);
            var future = enqueue(function() {
                return $http.post(util.contextRoot() + '/opus/' + opusId + '/florulaList', { florulaListId: listId })
            });
            return util.toStandardPromise(future);
        },

        getAuditHistory: function (objectId, offset, max) {
            $log.debug("Fetching audit for object " + objectId);
            var future = $http.get(util.contextRoot() + "/audit/object/" + objectId, {
                cache: true,
                params: {offset: offset, max: max}
            });
            future.then(function (response) {
                $log.debug("Audit fetched with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        deleteAttribute: function (opusId, profileId, attributeId) {
            $log.debug("Deleting attribute " + attributeId);
            var self = this;
            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/attribute/" + attributeId + "/delete");
            });
            future.then(function (response) {
                $log.debug("Attribute deleted with response code " + response.status);

                clearCache();

                // Refresh the shared profile to include the changes to the attributes - this will allow the
                // page name section to update to reflect the changes to any attributes reflecting a name.
                self.getProfile(opusId, profileId);
            });
            return util.toStandardPromise(future);
        },

        saveAttribute: function (opusId, profileId, attributeId, data) {
            $log.debug("Saving attribute " + attributeId);
            var future = null;
            var self = this;

            if (attributeId) {
                future = enqueue(function () {
                    return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/attribute/" + attributeId + "/update", data);
                });
            } else {
                future = enqueue(function () {
                    return $http.put(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/attribute/create", data);
                });
            }

            future.then(function (response) {
                $log.debug("Attribute saved with response code " + response.status);

                clearCache();

                // Refresh the shared profile to include the changes to the attributes - this will allow the
                // page name section to update to reflect the changes to any attributes reflecting a name.
                self.getProfile(opusId, profileId);
            });
            return util.toStandardPromise(future);
        },

        getPrimaryImage: function (opusId, profileId) {
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/primaryImage");
            return util.toStandardPromise(future);
        },

        retrieveImages: function (opusId, profileId, searchIdentifier, imageSources, readonlyView) {
            $log.debug("Retrieving images for " + searchIdentifier);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/images?searchIdentifier=" + searchIdentifier + "&imageSources=" + imageSources + "&readonlyView=" + readonlyView, {cache: true});
            future.then(function (response) {
                $log.debug("Images retrieved with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        //For the biocache webservice: 'pageSize' is same as 'rows' and 'startIndex' is same as 'start' in SOLR
        retrieveImagesPaged: function (opusId, profileId, searchIdentifier, readonlyView, nextPageNumber, numberToRetrieve) {
            $log.debug("Retrieving images for " + searchIdentifier);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/images/paged?searchIdentifier=" + searchIdentifier + "&readonlyView=" + readonlyView+"&pageSize="+numberToRetrieve+"&startIndex="+nextPageNumber, {cache: true});
            future.then(function (response) {
                $log.debug("Images retrieved with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        getImageMetadata: function (imageId, local) {
            var future = null;
            if (_.isBoolean(local) && local) {
                future = $http.get(util.contextRoot() + "/ws/getImageInfo/" + imageId, {cache: true});
            } else {
                future = $http.get(config.imageServiceUrl + "/ws/image/" + imageId, {cache: true});
            }
            return util.toStandardPromise(future);
        },

        saveImageMetadata: function(imageId, data) {
            $log.debug("Saving image metadata: " + imageId);
            var future = null;
            if (imageId) {
                future = enqueue(function() {
                    return $http.post(util.contextRoot() + "/image/" + imageId + "/metadata", data)
                });
            }

            return util.toStandardPromise(future);
        },

        publishPrivateImage: function (opusId, profileId, imageId) {
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/image/" + imageId + "/publish");
            });
            future.then(function (response) {
                $log.debug("Image published wtih response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        deleteLocalImage: function (opusId, profileId, imageId, type) {
            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/image/" + imageId + "/delete?type=" + type);
            });
            future.then(function (response) {
                $log.debug("Image deleted with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        retrieveLists: function (opusId, profileId, guid) {
            $log.debug("Retrieving lists for " + guid);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/lists?guid=" + guid, {cache: true});
            future.then(function (response) {
                $log.debug("Lists retrieved with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        getAllLists: function () {
            $log.debug("Fetching all species lists...");

            var future = $http.get(util.contextRoot() + "/speciesList", {cache: true});
            future.then(function (response) {
                $log.debug("Species lists fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getPublications: function (opusId, profileId) {
            $log.debug("Retrieving publications for profile " + profileId);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/publication", {cache: true});
            future.then(function (response) {
                $log.debug("Publication retrieved with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        deletePublication: function (opusId, profileId, publicationId) {
            $log.debug("Deleting publication " + publicationId);
            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/publication/" + publicationId + "/delete");
            });
            future.then(function (response) {
                $log.debug("Publication deleted with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        createPublication: function (opusId, profileId) {
            $log.debug("Creating publication...");
            var future = enqueue(function () {
                return $http.put(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/publication/create");
            });

            future.then(function (response) {
                $log.debug("Publication saved with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future);
        },

        getSpeciesProfile: function (opusId, profileId, guid) {
            $log.debug("Retrieving species profile for " + guid);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/speciesProfile?guid=" + guid, {cache: true, disableAlertOnFailure: true});
            future.then(function (response) {
                $log.debug("Species Profile retrieved with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        getFeatureLists: function (opusId, profileId) {
            $log.debug("Retrieving bio status for " + profileId);
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/featureList");
            future.then(function (response) {
                $log.debug("Bio status retrieved with response code " + response.status)
            });
            return util.toStandardPromise(future);
        },

        updateLinks: function (opusId, profileId, links) {
            $log.debug("Updating links for profile " + profileId);
            var future = enqueue(function () {
                console.log("saving links");
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/links/update", links);
            });
            future.then(function (response) {
                $log.debug("Links updated with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future);
        },

        updateBhlLinks: function (opusId, profileId, links) {
            $log.debug("Updating BHL links for profile " + profileId);
            var future = enqueue(function () {
                console.log("saving bhl");
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/bhllinks/update", links);
            });
            future.then(function (response) {
                $log.debug("BHL Links updated with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future);
        },

        lookupBhlPage: function (pageId) {
            $log.debug("Looking up BHL page " + pageId);
            var future = $http.get(util.contextRoot() + "/bhl/" + pageId);
            future.then(function (response) {
                $log.debug("BHL page retrieved with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        lookupSpecimenDetails: function (specimenId) {
            $log.debug("Looking up specimen details for id " + specimenId);

            var future = $http.get(util.contextRoot() + "/specimen/" + specimenId);
            future.then(function (response) {
                $log.debug("Specimen details retrieved with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        search: function (opusId, term, options) {
            var params;
            if (angular.isDefined(options)) {
                params = angular.copy(options);
            } else {
                params = {};
            }

            params['opusId'] = opusId;
            params['term'] = term;
            var future = $http.get(util.contextRoot() + "/profile/search", {params: params});
            future.then(function (response) {
                $log.debug("Profile search returned with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        profileSearch: function (opusId, scientificName, useWildcard, sortBy, autoCompleteScientificName) {
            $log.debug("Searching for " + scientificName + (useWildcard ? " with wildcard" : ""));

            if (typeof sortBy == 'undefined') {
                sortBy = "name";
            }
            if (typeof useWildcard == 'undefined') {
                useWildcard = true;
            }
            if (typeof autoCompleteScientificName == 'undefined') {
                autoCompleteScientificName = false;
            }
            if (typeof opusId == 'undefined') {
                opusId = "";
            }

            var params = {
                opusId: opusId,
                scientificName: scientificName,
                sortBy: sortBy,
                useWildcard: useWildcard,
                autoCompleteScientificName: autoCompleteScientificName
            };
            var future = $http.get(util.contextRoot() + "/profile/search/scientificName", { params: params });
            future.then(function (response) {
                $log.debug("Profile search returned with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        profileSearchByTaxonLevel: function (opusId, taxon, filter, max, offset) {

            var params = {
                opusId: opusId,
                taxon: taxon,
                max: max,
                offset: offset,
            };
            if (angular.isDefined(filter)) {
                params['filter'] = filter;
            }
            var future = $http.get(util.contextRoot() + "/profile/search/taxon/level", { params: params });
            future.then(function (response) {
                $log.debug("Facet search returned with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        profileSearchByTaxonLevelAndName: function (opusId, taxon, scientificName, max, offset, optionalParams) {
            var options = angular.extend({
                countChildren: false,
                sortBy: 'name',
                immediateChildrenOnly: false
            }, optionalParams);
            var params = {
                opusId: opusId,
                taxon: taxon,
                scientificName: scientificName,
                max: max,
                offset: offset,
                countChildren: options.countChildren,
                sortBy: options.sortBy,
                immediateChildrenOnly: options.immediateChildrenOnly
            };
            var future = $http.get(util.contextRoot() + "/profile/search/taxon/name", { params: params });
            future.then(function (response) {
                $log.debug("Facet search returned with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        profileCountByTaxonLevelAndName: function (opusId, taxon, scientificName, optionalParams) {
            var options = angular.extend({
                immediateChildrenOnly: false
            }, optionalParams);
            var params = {
                opusId: opusId,
                taxon: taxon,
                scientificName: scientificName,
                immediateChildrenOnly: options.immediateChildrenOnly
            };
            var future = $http.get(util.contextRoot() + "/profile/search/taxon/name/count", { params: params });
            future.then(function (response) {
                $log.debug("Profile count  by taxon level and name returned with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        profileSearchGetImmediateChildren: function (opusId, rank, name, max, offset, filter) {
            var params = {
                opusId: opusId,
                rank: rank,
                name: name,
                max: max,
                offset: offset
            };
            if (!(angular.isUndefined(filter) || !filter || filter.trim().length == 0)) {
                params['filter'] = filter;
            }
            var future = $http.get(util.contextRoot() + "/profile/search/children", { params: params });
            future.then(function (response) {
                $log.debug("Child search returned with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        getTaxonLevels: function (opusId) {
            var params = {
                opusId: opusId
            };
            var future = $http.get(util.contextRoot() + "/profile/search/taxon/levels", { params: params });
            future.then(function (response) {
                $log.debug("Get taxon levels returned with response code " + response.status);
            });
            return util.toStandardPromise(future);
        },

        listResources: function () {
            $log.debug("Fetching all resources");

            var future = $http.get(util.contextRoot() + "/dataResource");
            future.then(function (response) {
                $log.debug("Resources fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getResource: function (dataResourceId) {
            $log.debug("Fetching resource " + dataResourceId);

            var future = $http.get(util.contextRoot() + "/dataResource/" + dataResourceId);
            future.then(function (response) {
                $log.debug("Resource fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        listHubs: function () {
            $log.debug("Fetching all hubs");

            var future = $http.get(util.contextRoot() + "/dataHub");
            future.then(function (response) {
                $log.debug("Hubs fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getHub: function (dataHubId) {
            $log.debug("Fetching hub " + dataHubId);

            var future = $http.get(util.contextRoot() + "/dataHub/" + dataHubId);
            future.then(function (response) {
                $log.debug("Hub fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        userSearch: function (email) {
            $log.debug("Searching for user " + email);

            var future = $http.get(util.contextRoot() + "/user/search?userName=" + email);
            future.then(function (response) {
                $log.debug("Search completed with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        updateUsers: function (opusId, users) {
            $log.debug("Updating users for opus " + opusId);
            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/users/update", users);
            });
            future.then(function (response) {
                $log.debug("Update Users completed with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        uploadGlossary: function (opusId, data) {
            $log.debug("Uploading glossary for opus " + opusId);

            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/glossary/upload", data, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                });
            });
            future.then(function (response) {
                $log.debug("Uploaded glossary with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        getGlossary: function (opusId, prefix) {
            $log.debug("Fetching glossary for opus " + opusId);

            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/glossary/" + prefix);
            future.then(function (response) {
                $log.debug("Glossary fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        deleteGlossaryItem: function (opusId, glossaryItemId) {
            $log.debug("Deleting glossary item " + glossaryItemId);

            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/glossary/item/" + glossaryItemId + "/delete");
            });
            future.then(function (response) {
                $log.debug("Glossary item deleted with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        saveGlossaryItem: function (opusId, glossaryItemId, data) {
            $log.debug("Updating glossary item " + glossaryItemId);

            var future;
            if (glossaryItemId) {
                future = enqueue(function () {
                    return $http.post(util.contextRoot() + "/opus/" + opusId + "/glossary/item/" + glossaryItemId + "/update", data);
                });
            } else {
                future = enqueue(function () {
                    return $http.put(util.contextRoot() + "/opus/" + opusId + "/glossary/item/create", data);
                });
            }
            future.then(function (response) {
                $log.debug("Glossary item updated with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        addComment: function (opusId, profileId, data) {
            $log.debug("Creating comment for profile " + profileId);

            var future = enqueue(function () {
                return $http.put(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/comment/create", data);
            });
            future.then(function (response) {
                $log.debug("Comment created with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future)
        },

        updateComment: function (opusId, profileId, commentId, data) {
            $log.debug("Updating comment for profile " + profileId);

            var future = enqueue(function () {
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/comment/" + commentId + "/update", data);
            });
            future.then(function (response) {
                $log.debug("Comment updated with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future)
        },

        getComments: function (opusId, profileId) {
            $log.debug("Fetching comments for profile " + profileId);

            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/comment");
            future.then(function (response) {
                $log.debug("Comments fetched with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future)
        },

        deleteComment: function (opusId, profileId, commentId) {
            $log.debug("Deleting comment " + commentId);

            var future = enqueue(function () {
                return $http.delete(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/comment/" + commentId + "/delete");
            });
            future.then(function (response) {
                $log.debug("Comment deleted with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future)
        },

        saveAuthorship: function (opusId, profileId, authorship) {
            $log.debug("Saving authorship for profile " + profileId);

            var future = enqueue(function () {
                console.log("saving authorship");
                return $http.post(util.contextRoot() + "/opus/" + opusId + "/profile/" + profileId + "/authorship/update", authorship);
            });
            future.then(function (response) {
                $log.debug("Authorship updated with response code " + response.status);

                clearCache();
            });
            return util.toStandardPromise(future);
        },

        findKeybaseKeyForName: function (opusId, scientificName) {
            var future = $http.get(util.contextRoot() + "/keybase/findKey?opusId=" + opusId + "&scientificName=" + scientificName, {cache: true});

            return util.toStandardPromise(future);
        },

        retrieveKeybaseProjects: function () {
            $log.debug("Retrieving keybase projects");

            var future = $http.get(util.contextRoot() + "/keybase/projects", {cache: true});
            future.then(function (response) {
                $log.debug("Keybase projects retreived with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getLicences: function () {
            var future = $http.get(util.contextRoot() + "/licences", {cache: true});
            return util.toStandardPromise(future);
        },

        loadReport: function (opusId, reportId, pageSize, offset, period, from, to,
                              isCountOnly) {
            $log.debug("Loading report " + reportId);

            // these parameters are for recent updates. add them only if value is present.
            var dateParms = '';
            if (period) {
                dateParms = "&period=" + period;
                if (from && to) {
                    dateParms += "&from=" + from + "&to=" + to;
                }
            }

            var countParms = '';
            if (isCountOnly) {
                countParms = "&countOnly=true";
            }

            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/report/"
                + reportId + "?pageSize=" + pageSize + "&offset=" + offset + dateParms
                + countParms);
            future.then(function (response) {
                $log.debug("Report loaded with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getNomenclatureList: function (nslNameIdentifier) {
            $log.debug("Fetching nomenclature list for " + nslNameIdentifier);

            var future = $http.get(util.contextRoot() + "/nsl/listConcepts/" + nslNameIdentifier, {cache: true});
            future.then(function (response) {
                $log.debug("Nomenclature concepts fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getNslNameDetails: function (nslNameIdentifier) {
            $log.debug("Fetching name details for NSL name " + nslNameIdentifier);

            var future = $http.get(util.contextRoot() + "/nsl/nameDetails/" + nslNameIdentifier, {cache: true});
            return util.toStandardPromise(future);
        },

        getPublicationsFromId: function (pubId) {
            $log.debug("Fetching publication with Publication Id:" + pubId);

            var future = $http.get(util.contextRoot() + "/publication/" + pubId + "/json", {cache: true});
            future.then(function (response) {
                $log.debug("Publications fetched with " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getStatistics: function (opusId) {
            $log.debug("Fetching statistics");

            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/statistics", {cache: true});
            future.then(function (response) {
                $log.debug("Statistics fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getUserDetails: function (opusId) {
            var future = $http.get(util.contextRoot() + "/user/details?opusId=" + opusId, {cache: true});
            future.then(function (response) {
                $log.debug("User details fetched with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        deleteAttachment: function (opusId, profileId, attachmentId) {
            $log.debug("Deleting attachment " + attachmentId);

            var url = util.contextRoot() + "/opus/" + opusId;
            if (!_.isUndefined(profileId) && profileId && profileId.trim().length > 0) {
                url += "/profile/" + profileId;
            }
            url += "/attachment/" + attachmentId;

            var future = $http.delete(url);

            future.then(function (response) {
                $log.debug("Attachment deleted with response code " + response.status);

                clearCache();
            });

            return util.toStandardPromise(future);
        },

        getAttachmentMetadata: function (opusId, profileId, attachmentId) {
            $log.debug("Getting attachment metadata");

            var url = util.contextRoot() + "/opus/" + opusId;
            if (!_.isUndefined(profileId) && profileId && profileId.trim().length > 0) {
                url += "/profile/" + profileId;
            }
            url += "/attachment";
            if (!_.isUndefined(attachmentId) && attachmentId && attachmentId.trim().length > 0) {
                url += "/" + attachmentId;
            }

            var future = $http.get(url, {cache: true});
            future.then(function (response) {
                $log.debug("Attachment metadata retrieved with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        getBiocacheLegend: function(occurrenceQuery, colourBy) {
            var future = $http.get(config.biocacheServiceUrl + "/occurrence/legend?type=application/json&" + occurrenceQuery + "&cm=" + colourBy);
            future.then(function (response) {
                $log.debug("Occurrence Query legend retrieved with response code " + response.status);
            });

            return util.toStandardPromise(future);
        },

        autocompleteName: function(prefix) {
            return $http.get(config.bieServiceUrl + "/ws/search/auto.json?idxType=TAXON&q=" + prefix);
        },

        getTags: function() {
            var future = $http.get(util.contextRoot() + "/tags");
            return util.toStandardPromise(future);
        },

        getDataSets: function(opusId) {
            var future = $http.get(util.contextRoot() + "/opus/" + opusId + "/data");
            return util.toStandardPromise(future);
        },

        deleteDataSet: function(opusId, dataSetId) {
            var future = $http.delete(util.contextRoot() + "/opus/" + opusId + "/data/" + dataSetId + "/delete");

            return util.toStandardPromise(future);
        },

        addMultimedia: function(profile, multimedia) {
            var future = $http.post(util.contextRoot() + "/opus/" + profile.opusId + "/profile/" + profile.uuid + "/multimedia", multimedia);
            return util.toStandardPromise(future);
        },

        editMultimedia: function(profile, multimedia) {
            if (multimedia.documentId) {
                var future = $http.post(util.contextRoot() + "/opus/" + profile.opusId + "/profile/" + profile.uuid + "/multimedia/" + multimedia.documentId, multimedia);
                return util.toStandardPromise(future);
            } else {
                return this.addMultimedia(profile,multimedia);
            }
        },

        deleteMultimedia: function(profile, multimediaId) {
            var future = $http.delete(util.contextRoot() + "/opus/" + profile.opusId + "/profile/" + profile.uuid + "/multimedia/" + multimediaId);
            return util.toStandardPromise(future);
        },

        setPrimaryMultimedia: function(profile, primaryAudio, primaryVideo) {
            var future = $http.post(util.contextRoot() + "/opus/" + profile.opusId + "/profile/" + profile.uuid + "/primaryMultimedia", {primaryAudio: primaryAudio, primaryVideo: primaryVideo});
            return util.toStandardPromise(future);
        },

        setStatus: function(profile, status) {
            var future = $http.post(util.contextRoot() + '/opus/' + profile.opusId + '/profile/' + profile.uuid + '/status', { status: status }, {disableAlertOnFailure: true });
            return util.toStandardPromise(future);
        },

        loadMasterListItems: function(opus) {
            var future = $http.get(util.contextRoot() + '/opus/' + opus.uuid + '/masterList/keybaseItems', {disableAlertOnFailure: true });
            return util.toStandardPromise(future);
        }
    }
});

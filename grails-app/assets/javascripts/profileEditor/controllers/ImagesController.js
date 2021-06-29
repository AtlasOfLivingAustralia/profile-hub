/**
 * Images controller
 */
profileEditor.controller('ImagesController', function ($browser, $scope, profileService, util, messageService, $modal, config) {
    var self = this;
    self.defaultPageSize = 20;

    // Flag to prevent reloading images during the update process.
    var saving = false;

    self.images = [];
    self.primaryImage = null;
    self.availableImages = 0;

    self.init = function (edit) {
        self.readonly = edit != 'true';
        self.images = [];

        self.opusId = util.getEntityId("opus");
        self.profileId = util.getEntityId("profile");

        var profilePromise = profileService.getProfile(self.opusId, self.profileId);

        profilePromise.then(function (data) {
                self.profile = data.profile;
                self.opus = data.opus;

                // If the primary image specified for the profile changes then reload the images.
                // Note that this function will be called once for initiation which is required to load the images.
                $scope.$watch(function () {
                    return self.profile && self.profile.primaryImage;
                }, function () {
                    if (!saving) {
                        self.loadImages();
                    }
                });

            },
            function () {
                messageService.alert("An error occurred while retrieving the profile.");
            }
        );
    };

    self.saveProfile = function (form) {
        saving = true;

        if (!self.profile.imageSettings) {
            self.profile.imageSettings = [];
        }

        self.profile.primaryImage = null;

        angular.forEach(self.images, function (image) {
            self.profile.imageSettings.push({
                imageId: image.imageId,
                caption: image.caption,
                displayOption: image.displayOption
            });

            if (image.primary) {
                self.profile.primaryImage = image.imageId;
            }
        });

        var profilePromise = profileService.updateProfile(self.opusId, self.profileId, self.profile);

        profilePromise.then(function (data) {
                messageService.info("Updating profile...");
                self.profile = data;

                var loadImagesProfile = self.loadImages(self.offset);

                form.$setPristine();

                loadImagesProfile.finally(function () {
                    saving = false;
                });
            },
            function () {
                saving = false;

                messageService.alert("An error occurred while updating the profile.");
            }
        );
    };


    self.loadImages = function (offset, itemsPerPage) {
        if (_.isUndefined(offset)) {
            offset = 0;
        }
        if (_.isUndefined(itemsPerPage)) {
            itemsPerPage = self.defaultPageSize;
        }

        messageService.info("Loading images...");

        var searchIdentifier = self.profile.guid ? "lsid:" + self.profile.guid : "";

        var imagesPromise = profileService.retrieveImagesPaged(self.opusId, self.profileId, searchIdentifier, self.readonly, offset, itemsPerPage);

        imagesPromise.then(function (data) {
                self.images = [];
                angular.forEach(data.images, function (image) {
                    if (!self.readonly || !image.excluded) {
                        self.images.push(image);
                    }
                });

                if (data.primaryImage && data.primaryImage.imageId == self.profile.primaryImage) {
                    self.primaryImage = data.primaryImage;
                }

                if (!self.primaryImage && self.images.length > 0) {
                    angular.forEach(self.images, function (image) {
                        if (!image.excluded && !self.primaryImage) {
                           self.primaryImage = image;
                        }
                    });
                }

                var totalNumberOfImages = data.count;

                if (totalNumberOfImages <= itemsPerPage) {
                    itemsPerPage = totalNumberOfImages
                }

                //data for pagination
                self.offset = offset;
                self.totalItems = totalNumberOfImages;
                self.itemsPerPage = itemsPerPage;
                self.paginate = (self.totalItems > self.itemsPerPage);
                self.availableImagesCount = data.availImagesCount;
            },

            function () {
                messageService.alert("An error occurred while retrieving the images.");
            }
        );
        return imagesPromise;
    }; //end of loadImages


    self.changeImageDisplay = function (form) {
        form.$setDirty();
    };

    self.changePrimaryImage = function (imageId, form) {
        angular.forEach(self.images, function (image) {
            image.primary = image.imageId == imageId;
        });

        form.$setDirty();
    };

    self.uploadImage = function () {
        var popup = $modal.open({
            templateUrl: "/profileEditor/imageUploadModal.htm",
            controller: "ImageUploadController",
            controllerAs: "imageUploadCtrl",
            size: "md",
            resolve: {
                opus: function () {
                    return self.opus;
                },
                image: function () {
                    return null;
                }
            }
        });

        popup.result.then(function () {
            self.loadImages();
        });
    };

    self.editImage = function (image, offset, pageNumber) {
        if (_.isUndefined(pageNumber)) {
            pageNumber = 1;
        }

        var popup = $modal.open({
            templateUrl: "/profileEditor/imageUploadModal.htm",
            controller: "ImageUploadController",
            controllerAs: "imageUploadCtrl",
            size: "md",
            resolve: {
                opus: function () {
                    return self.opus;
                },
                image: function () {
                    return image;
                }
            }
        });

        popup.result.then(function (image) {
            self.page = pageNumber;
            self.offset = offset;
            self.loadImages(offset);
        });
    };

    /**
     * Display the image viewer popup
     * @param image May be either a string (the image id) or an object (the image)
     */
    self.showMetadata = function (image, local) {
        if (_.isString(image)) {
            if (angular.isDefined(self.images) && self.images.length > 0) {
                image = _.find(self.images, function (image) {
                    return image.imageId == image;
                });
            } else {
                var future = profileService.getImageMetadata(image, local);
                future.then(function (imageDetails) {
                    imageDetails.imageId = image;
                    // extract the metadata from the image service response and place it in a 'metadata' map so we have the
                    // same format as for local images, if it is not present
                    if (_.isUndefined(imageDetails.metadata)) {
                        imageDetails.metadata = {};
                        imageDetails.metadata.rightsHolder = imageDetails.rightsHolder;
                        imageDetails.metadata.dateTaken = imageDetails.dateTaken;
                        imageDetails.metadata.creator = imageDetails.creator;
                        imageDetails.metadata.license = imageDetails.license;
                        imageDetails.metadata.description = imageDetails.description;
                        imageDetails.metadata.title = imageDetails.title;
                        imageDetails.metadata.rights = imageDetails.rights;
                    }

                    showMetadataPopup(imageDetails);
                }, function () {
                    messageService.alert("An error occurred while retrieving the image details");
                });
            }
        } else if (_.isUndefined(image.metadata)) {
            var future = profileService.getImageMetadata(image.imageId, local);
            future.then(function (imageDetails) {
                imageDetails.imageId = image;
                showMetadataPopup(imageDetails);
            }, function () {
                messageService.alert("An error occurred while retrieving the image details");
            });
        } else {
            showMetadataPopup(image);
        }

    };

    function showMetadataPopup(image) {
        var popup = $modal.open({
            templateUrl: "/profileEditor/imageMetadata.htm",
            controller: "ImageMetadataController",
            controllerAs: "imageMetadataCtrl",
            size: "lg",
            resolve: {
                image: function () {
                    return image;
                }
            }
        });

        popup.opened.then(function () {
            // Disable the Leaflet.Sleep functionality, which is enabled by default as soon as Leaflet.Sleep.js is included.
            // The ALA Map plugin uses this, but it explicitly enables/disables the feature based on its config.
            L.Map.mergeOptions({
                sleep: false
            });

            var baseUrl = null;
            if (_.isUndefined(image.type) || image.type.name == 'OPEN') {
                if (angular.isDefined(image.thumbnailUrl)) {
                    baseUrl = util.getBaseUrl(image.thumbnailUrl);
                } else if (angular.isDefined(image.imageUrl)) {
                    baseUrl = util.getBaseUrl(image.imageUrl);
                } else {
                    baseUrl = config.imageServiceUrl;
                }

                // make sure we're calling the httpS version of images.ala.org.au
                if (baseUrl.indexOf("images.ala.org.au") != -1) {
                    baseUrl = config.imageServiceUrl;
                }
            } else {
                baseUrl = util.getBaseHref(true);
            }

            imgvwr.viewImage('#imageViewer', image.imageId, undefined, undefined, {
                imageServiceBaseUrl: baseUrl,
                addDrawer: false,
                addSubImageToggle: false,
                addCalibration: false,
                addImageInfo: false,
                imageClientUrl: util.contextRoot()
            });
        });

        popup.result.then(function () {
            self.loadImages();
        });
    }

    self.publishPrivateImage = function (imageId) {
        var confirm = util.confirm("Are you sure you wish to make this image available to other Atlas of Living Australia applications?");

        confirm.then(function () {
            var future = profileService.publishPrivateImage(self.opusId, self.profileId, imageId);

            future.then(function () {
                self.loadImages();

                messageService.success("Your images has been successfully published to the Atlas of Living Australia image library.");
            }, function () {
                messageService.alert("An error occurred while publishing your image.");
            })
        })
    };

    self.deleteLocalImage = function (imageId, type) {
        var confirm = util.confirm("Are you sure you wish to delete this image?");

        confirm.then(function () {
            var future = profileService.deleteLocalImage(self.opusId, self.profileId, imageId, type);

            future.then(function () {
                self.loadImages();
            }, function () {
                messageService.alert("An error occurred while deleting your staged image.");
            });
        });
    };

    self.imageCaption = function (image) {
        if (!image) return '';
        if (image.caption) {
            return image.caption;
        }
        return image.metadata ? image.metadata.title : '';
    };
});


/**
 * Image metadata modal dialog controller
 */
profileEditor.controller("ImageMetadataController", function ($modalInstance, image) {
    var self = this;

    self.image = image;

    self.cancel = function () {
        $modalInstance.dismiss("cancel");
    }
});
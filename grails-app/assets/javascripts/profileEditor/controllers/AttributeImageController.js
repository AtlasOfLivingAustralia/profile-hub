/**
 * Controller for handling images within attributes
 */
profileEditor.controller('AttributeImageController', function ($scope, profileService, util, messageService, $window, $filter, $modal, $modalInstance, opus, profile) {
    var self = this;

    self.mode = 'select'; // select or upload

    self.showExcluded = false;

    self.images = [];
    self.position = "float-end";
    self.size = "small";

    self.image = null;

    self.opus = opus;
    self.profile = profile;

    self.contextPath = util.contextRoot();
    self.uploadContentTemplate = '/profileEditor/imageUpload.htm';

    self.uploadUrl = util.contextRoot() + "/opus/" + util.getEntityId("opus") + "/profile/" + util.getEntityId("profile") + "/image/upload";

    self.loadImages = function(forceReload) {
        if (self.images.length == 0 || forceReload) {
            var searchIdentifier = self.profile.guid ? "lsid:" + self.profile.guid : "";

            var sources = angular.copy(self.opus.dataResourceConfig.imageSources);
            sources.unshift(self.opus.dataResourceUid);

            self.loading = true;
            var future = profileService.retrieveImages(opus.uuid, self.profile.uuid, searchIdentifier, sources.join(","), true);
            future.then(function (data) {
                angular.forEach(data, function (image) {
                    if (self.showExcluded || !image.excluded) {
                        self.images.push(image);
                    }
                });
                self.loading = false;
            }, function () {
                messageService.alert("An error occurred while retrieving the profile's images");
                self.loading = false;
            });
        }
    };

    self.loadImages();

    $scope.$watch(self.showExcluded, function(newValue, oldValue) {
        if (_.isBoolean(newValue) && newValue != oldValue) {
            self.loadImages(true);
        }
    });

    self.uploadImage = function (imageMetadata) {
        self.image = imageMetadata;

        self.ok(true);
    };

    self.selectImage = function (image) {
        self.image = image;
    };

    self.ok = function(uploaded) {
        if (self.mode == 'select' || uploaded) {
            if (!self.image) {
                findSelectedImage();
            }
            if (self.image.thumbnailUrl.indexOf("http") != 0) {
                var needsContextRoot = self.image.thumbnailUrl.indexOf(util.contextRoot()) != 0;
                self.image.thumbnailUrl = util.getBaseHref(needsContextRoot) + self.image.thumbnailUrl;
            }

            self.image.position = self.position;
            self.image.size = self.size;

            $modalInstance.close(self.image);
        } else {
            $scope.$broadcast("performUpload");
        }
    };

    self.cancel = function() {
        $modalInstance.dismiss("cancel");
    };

    function findSelectedImage() {
        self.image = _.find(self.images, function(image) { return image.selected });
    }
});
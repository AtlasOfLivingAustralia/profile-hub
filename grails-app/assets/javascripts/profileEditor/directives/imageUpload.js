profileEditor.directive('imageUpload', function ($browser, $http, config) {
    return {
        restrict: 'AE',
        require: [],
        scope: {
            opus: '=',
            image: '=?',
            callbackFn: '&onUploadComplete', // function to be invoked when the upload is complete - takes a single parameter: the image metadata object
            uploadOnEvent: '@', // name of the event to be $broadcast by the parent scope to trigger the upload (e.g. when embedding the upload form in a larger form with a single OK button)
            updateOnEvent: '@?', // name of the event to be $broadcast by the parent scope to trigger saving metadata
            showMetadata: '@', // true to ask for metadata fields, false to just ask for the file
            disableSource: '=?', // true to disable source selection and only offer the default (file upload)
            uploadUrl: '@url', // the url to post the file to
            uploadUrlFn: '&?urlGenerator' // the function will return upload url
        },
        templateUrl: '/profileEditor/imageUpload.htm',
        controllerAs: 'imageUpload',
        controller: ['$scope', 'profileService', 'util', 'Upload', '$cacheFactory', '$filter', function ($scope, profileService, util, Upload, $cacheFactory, $filter) {
            var self = this;
            if ($scope.image) {
                $scope.updateMode = true;
                $scope.metadata = $scope.image.metadata;
            } else {
                $scope.updateMode = false;
                $scope.metadata = {rightsHolder: $scope.opus.title};
            }
            $scope.disableSource = angular.isDefined($scope.disableSource) ? $scope.disableSource : false;
            self.files = [];
            self.url = '';
            self.source = 'file';
            $scope.error = null;
            $scope.showMetadata = true;

            $scope.callbackHandler = $scope.callbackFn();
            $scope.uploadUrlGenerator = $scope.uploadUrlFn();

            $scope.licences = null;

            $scope.valid = false;

            var orderBy = $filter("orderBy");

            profileService.getLicences().then(function (data) {
                $scope.licences = _.pluck(data, "name").sort();
                if (!$scope.metadata.licence && $scope.licences) {
                    $scope.metadata.licence = $scope.licences[0];
                }
            });

            self.clearFiles = function() {
                self.files.length = 0;
            };

            self.clearUrl = function() {
                self.url = '';
            };

            $scope.doUpload = function () {
                $scope.metadata.dataResourceId = $scope.opus.dataResourceUid;
                $scope.metadata.created = util.formatLocalDate($scope.metadata.created);
                if (self.files.length > 0) {
                    var uploadUrl = $scope.uploadUrl;
                    // if upload url is not given and then check if function is provided, then evaluate it.
                    if(!uploadUrl && typeof $scope.uploadUrlGenerator == 'function'){
                        uploadUrl = $scope.uploadUrlGenerator()
                    }

                    Upload.upload({
                        url: uploadUrl,
                        fields: $scope.metadata,
                        file: self.files[0]
                    }).success(handleUploadSuccess).error(function () {
                        $scope.error = "An error occurred while uploading your image.";
                    });
                } else if (self.url) {
                    var data = angular.copy($scope.metadata);
                    data['url'] = self.url;
                    $http({
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        url: $scope.uploadUrl,
                        data: $.param(data)  // TODO replace this with $httpParamSerializer in angular 1.4+
                    }).then(function(result) { return result.data; }).then(handleUploadSuccess, function() {
                        $scope.error = "An error occurred while uploading your image.";
                    });
                } else {
                    console.error("'performUpload' event broadcast when there are 0 files to be uploaded");
                }
            };

            function handleUploadSuccess(imageMetadata) {
                $scope.image = {};
                self.files = [];
                $cacheFactory.get('$http').removeAll();

                if (angular.isDefined($scope.callbackHandler)) {
                    $scope.callbackHandler(imageMetadata);
                }
            }

            $scope.save = function() {
              if ($scope.image) {
                  $scope.metadata.created = util.formatLocalDate($scope.metadata.created);
                  $cacheFactory.get('$http').removeAll();

                  profileService.saveImageMetadata(util.getEntityId("opus"), $scope.image.imageId, $scope.metadata).then(function(data) {
                      if (angular.isDefined($scope.callbackHandler)) {
                          $scope.callbackHandler(data);
                      }
                  }, function (error) {
                      $scope.error = "An error occurred while updating your image."
                  });
              } else {
                  console.error("'save' event when there is not existing image")
              }
            };

            self.imageLoadErrorUrl = config.imageLoadErrorUrl;

            $scope.$on($scope.uploadOnEvent, $scope.doUpload);
            $scope.$on($scope.updateOnEvent, $scope.save);
        }],
        link: function(scope) {
            scope.$watch ("showMetadata", function(newValue) {
                if (angular.isDefined(newValue)) {
                    scope.showMetadata = isTruthy(newValue);
                }
            });
        }
    };

    function isTruthy(str) {
        return str == true || str === "true"
    }
});
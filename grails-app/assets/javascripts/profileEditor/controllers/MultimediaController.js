(function() {
    "use strict";
    function MultiMediaController($log, $modal, util, embedService, profileService, messageService) {
        var self = this;

        //self.profile bound by component (directive)
        //self.readonly bound by component (directive)

        self.isReadOnly = self.readonly();
        self.isEdittable = !self.isReadOnly;

        self.selectedMultimedia = null;
        self.selectedEmbed = null;
        self.selectedEmbedLoading = false;
        self.selectedEmbedFailed = false;

        self.play = function(doc) {
            self.selectedMultimedia = doc;
        };

        self.icon = function(doc) {
            switch (doc.type) {
                case 'video': return 'fa-file-video-o';
                case 'audio': return 'fa-file-audio-o';
                default: return 'fa-file-image-o';
            }
        };

        self.clearPrimaryAudio = function() {
            self.profile.primaryAudio = null;
            self.MultimediaForm.$setDirty();
        };
        self.clearPrimaryVideo = function() {
            self.profile.primaryVideo = null;
            self.MultimediaForm.$setDirty();
        };

        self.savePrimaryMultimedia = function() {
            profileService.setPrimaryMultimedia(self.profile, self.profile.primaryAudio, self.profile.primaryVideo).then(function(response) {
                messageService.info("Updated primary multimedia");
                self.MultimediaForm.$setPristine();
            }, function() {
                messageService.alert("Failed to update primary multimedia 😔");
            });
        };

        self.delete = function(doc) {
            util.confirm("Art thou sure?").then(function() {
                doc.deleting = true;
                profileService.deleteMultimedia(self.profile, doc.documentId).then(
                  function() {
                      self.profile.documents.splice(_.indexOf(self.profile.documents, doc), 1);
                      if (self.profile.primaryAudio === doc.documentId) {
                          self.profile.primaryAudio = null;
                      }
                      if (self.profile.primaryVideo === doc.documentId) {
                          self.profile.primaryVideo = null;
                      }
                  }, function(error) {
                      doc.deleting = false;
                      $log.error("Couldn't delete doc", doc, error);
                      messageService.alert("Failed to delete \"" + doc.name + "\". #sadness");
                  }
                );
            });
        };

        self.edit = function(doc) {
            showMultimediaDialog(doc).then(function(result) {
                profileService.editMultimedia(self.profile, result).then(function() {
                    angular.extend(doc, result);
                }, function(error) {
                    $log.error("Couldn't save doc", doc, result, error);
                    messageService.alert("Couldn't save \"" + result.name +"\". #sadface");
                });
            });
        };

        self.add = function() {
            showMultimediaDialog({
                name: ''
            }).then(function(doc) {
                self.adding = true;
                profileService.addMultimedia(self.profile, doc).then(function(result) {
                    self.adding = false;
                    doc.documentId = result.documentId;
                    self.profile.documents.push(doc);
                }, function(error) {
                    self.adding = false;
                    $log.error("Couldn't save doc", error);
                    messageService.alert("Couldn't save yer doc, doc. #sadface");
                })
            });
        };

        function showMultimediaDialog(doc) {
            // TODO refactor to separate dialog service?
            var dialog = $modal.open({
                templateUrl: "/profileEditor/multimediaDialog.htm",
                controller: "MultimediaDialogController",
                controllerAs: "mmDlgCtrl",
                size: "lg",
                resolve: {
                    doc: function () {
                        return doc;
                    }
                }
            });

            return dialog.result;
        }
    }

    // TODO Angular 1.5 directive -> component, scope -> bindToController
    profileEditor.directive('multimedia', ['util', function (util) {
        return {
            restrict: 'AE',
            scope: {
                profile: '=',
                readonly: '='
            },
            controller: ['$log', '$modal', 'util', 'embedService', 'profileService', 'messageService', MultiMediaController],
            controllerAs: 'mmCtrl',
            bindToController: true,
            templateUrl: '/profileEditor/multimedia.htm'
        };
    }]);

    profileEditor.controller("MultimediaDialogController", ["$modalInstance", "embedService", "doc", function($modalInstance, embedService, doc) {
        var self = this;

        self.originalDoc = doc;
        self.doc = angular.copy(doc);
        self.description = null;
        self.previousDescription = null;

        self.urlUpdated = function() {
            if (self.description) {
                self.doc.type = self.description.service.type;
                if (!self.doc.name || (self.previousDescription && self.previousDescription.embed.title == self.doc.name)) {
                    self.doc.name = self.description.embed.title;
                }
                if (!self.doc.attribution || (self.previousDescription && self.previousDescription.embed.author_name == self.doc.attribution)) {
                    self.doc.attribution = self.description.embed.author_name;
                }
                self.previousDescription = self.description;
            }
        };

        self.save = function() {
            $modalInstance.close(self.doc);
        };

        self.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

    }]);

    function EmbedController($scope, embedService) {
        var self = this;

        self.play = function() {
            self.embedDescription = null;
            self.embedDescriptionFailed = false;

            if (self.multimedia) {
                embedService.describe(self.multimedia.url).then(function (embed) {
                    self.embedDescription = embed;
                    self.embedDescriptionFailed = false;
                }, function() {
                    self.embedDescription = null;
                    self.embedDescriptionFailed = true;
                });
            }
        };

        $scope.$watch(
          function() { return self.multimedia; },
          function handleMultimediaChange(newValue, oldValue) {

            self.play();
          }
        );

        self.play();
    }

    /**
     * Directive that turns a profile mutltimedia document into an embeded container and loads the
     * embedded content.
     */
    // TODO Angular 1.5 directive -> component, scope -> bindToController
    profileEditor.directive('embed', ['util', function (util) {
        return {
            restrict: 'AE',
            scope: {
                multimedia: '=selectedMultimedia'
            },
            controller: ['$scope', 'embedService', EmbedController],
            controllerAs: 'embedCtrl',
            bindToController: true,
            replace: true,
            templateUrl: '/profileEditor/embed.htm'
        };
    }]);

    /**
     * Simple directive that validates the value using the embed service and can return the embed description to the
     * attributes value.
     *
     * TODO split this out to separate directive maybe?
     */
    profileEditor.directive('oembed', ['$parse', '$q', 'embedService', function($parse, $q, embedService) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                var parsedOembed = $parse(attrs.oembed),
                  parsedOembedAssign = parsedOembed.assign;

                ctrl.$asyncValidators.description = function(modelValue, viewValue) {

                    if (ctrl.$isEmpty(modelValue)) {
                        // consider empty model valid
                        if (parsedOembedAssign) {
                            parsedOembedAssign(scope, null);
                        }
                        return $q.when();
                    }

                    return embedService.describe(modelValue).then(function(result) {
                        if (parsedOembedAssign) {
                            parsedOembedAssign(scope, result);
                        }
                        return result;
                    });
                };
            }
        };
    }]);
}());

(function() {
    "use strict";

    function SoundController($modal, util, profileService, messageService) {
        var self = this;

        self.isReadOnly = self.readonly();
        self.isEditable = !self.isReadOnly;
        self.sounds = [];
        self.opusId = util.getEntityId("opus");
        self.profileId = util.getEntityId("profile");

        self.refresh = function() {
            profileService.getAttachmentMetadata(self.opusId, self.profileId, null).then(function(attachments) {
                self.profile.attachments = attachments;
                self.sounds = _.filter(attachments, function(attachment) {
                    return attachment.type === 'sound';
                });
            }, function() {
                messageService.alert("An error occurred while retrieving sounds");
            });
        };

        self.rawUrl = function(sound) {
            return util.contextRoot() + "/opus/" + encodeURIComponent(self.opusId) + "/profile/" +
                encodeURIComponent(self.profileId) + "/sound/" + encodeURIComponent(sound.uuid);
        };

        self.qrUrl = function(sound) {
            return self.rawUrl(sound) + "/qr";
        };

        self.savePrimarySound = function() {
            profileService.setPrimaryMultimedia(self.profile, self.profile.primaryAudio, self.profile.primaryVideo).then(function() {
                messageService.info("Updated primary sound");
                self.SoundForm.$setPristine();
            }, function() {
                messageService.alert("Failed to update the primary sound");
            });
        };

        self.hasPrimarySound = function() {
            return _.some(self.sounds, function(sound) {
                return sound.uuid === self.profile.primaryAudio;
            });
        };

        self.clearPrimarySound = function() {
            if (self.hasPrimarySound()) {
                self.profile.primaryAudio = null;
                self.SoundForm.$setDirty();
            }
        };

        self.deleteSound = function(sound) {
            util.confirm("Are you sure you wish to delete this sound? This operation cannot be undone.").then(function() {
                profileService.deleteAttachment(self.opusId, self.profileId, sound.uuid).then(function() {
                    if (self.profile.primaryAudio === sound.uuid) {
                        self.profile.primaryAudio = null;
                    }
                    self.refresh();
                }, function() {
                    messageService.alert("An error occurred while deleting the sound");
                });
            });
        };

        self.addSound = function() {
            showSoundDialog({type: 'sound'});
        };

        self.editSound = function(sound) {
            showSoundDialog(sound);
        };

        function showSoundDialog(sound) {
            var dialog = $modal.open({
                templateUrl: "/profileEditor/soundUpload.htm",
                controller: "SoundUploadController",
                controllerAs: "soundUploadCtrl",
                size: "md",
                resolve: {
                    sound: function() {
                        return sound;
                    }
                }
            });

            dialog.result.then(self.refresh);
        }

        self.refresh();
    }

    profileEditor.directive('sounds', function() {
        return {
            restrict: 'E',
            scope: {
                profile: '=',
                readonly: '='
            },
            controller: ['$modal', 'util', 'profileService', 'messageService', SoundController],
            controllerAs: 'soundCtrl',
            bindToController: true,
            templateUrl: '/profileEditor/sounds.htm'
        };
    });

    profileEditor.controller('SoundUploadController', function(profileService, util, config, $modalInstance,
                                                                Upload, $cacheFactory, $filter, sound) {
        var self = this;

        self.opusId = util.getEntityId('opus');
        self.profileId = util.getEntityId('profile');
        self.metadata = angular.copy(sound || {type: 'sound'});
        self.metadata.type = 'sound';
        self.file = null;
        self.error = null;
        self.maxFileSize = config.maxSoundFileSize;
        self.maxFileSizeMb = (self.maxFileSize / 1000000).toFixed(1);

        profileService.getLicences().then(function(licences) {
            self.licences = $filter('orderBy')(licences, 'name');
            if (!self.metadata.licence && self.licences.length) {
                self.metadata.licence = self.licences[0].name;
            }
        });

        self.ok = function() {
            var file = angular.isArray(self.file) ? self.file[0] : self.file;

            if (!self.metadata.uuid && (!file || file.size > self.maxFileSize)) {
                self.error = !file ? 'Choose an MP3 or WAV file.' :
                    'The sound file exceeds the maximum size of ' + self.maxFileSizeMb + ' MB.';
                return;
            }

            Upload.upload({
                url: util.contextRoot() + '/opus/' + self.opusId + '/profile/' + self.profileId + '/attachment',
                file: self.metadata.uuid ? null : file,
                data: self.metadata
            }).success(function() {
                $cacheFactory.get('$http').removeAll();
                $modalInstance.close();
            }).error(function(data) {
                self.error = data && data.error ? data.error : 'An error occurred while uploading the sound.';
            });
        };

        self.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
})();

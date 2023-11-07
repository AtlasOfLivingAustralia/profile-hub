/**
 *  Attachment/document controller
 */
profileEditor.controller('AttachmentController', function (profileService, messageService, util, $modal) {
    var self = this;

    self.opusId = util.getEntityId("opus");
    self.profileId = util.getEntityId("profile");

    self.downloadUrl = util.contextRoot() + "/opus/" + self.opusId;
    if (self.profileId) {
        self.downloadUrl += "/profile/" + self.profileId;
    }
    self.downloadUrl += "/attachment/";

    self.loadAttachments = function () {
        var future = profileService.getAttachmentMetadata(self.opusId, self.profileId, null);
        future.then (function (data) {
                self.attachments = data;
            },
            function () {
                messageService.alert("An error occurred while retrieving attachments");
            }
        );
    };

    self.deleteAttachment = function (attachmentId) {
        var deleteConf = util.confirm("Are you sure you wish to delete this attachment? This operation cannot be undone.");
        deleteConf.then(function () {
            var future = profileService.deleteAttachment(self.opusId, self.profileId, attachmentId);
            future.then (function () {
                    self.loadAttachments();
                },
                function () {
                    messageService.alert("An error occurred while deleting the attachment");
                }
            );
        });
    };

    self.uploadAttachment = function () {
        var popup = $modal.open({
            templateUrl: "/profileEditor/attachmentUpload.htm",
            controller: "AttachmentUploadController",
            controllerAs: "attachmentUploadCtrl",
            size: "md",
            resolve: {
                attachment: function () {
                    return {};
                }
            }
        });

        popup.result.then(function () {
            self.loadAttachments();
        });
    };

    self.editAttachment = function (attachment) {
        var popup = $modal.open({
            templateUrl: "/profileEditor/attachmentUpload.htm",
            controller: "AttachmentUploadController",
            controllerAs: "attachmentUploadCtrl",
            size: "md",
            resolve: {
                attachment: function () {
                    return attachment;
                }
            }
        });

        popup.result.then(function () {
            self.loadAttachments();
        });
    };

    self.loadAttachments();
});


/**
 * Upload image modal dialog controller
 */
profileEditor.controller("AttachmentUploadController", function (profileService, util, config, $modalInstance, Upload, $cacheFactory, $filter, attachment) {
    var self = this;

    self.opusId = util.getEntityId("opus");
    self.profileId = util.getEntityId("profile");

    var urlType = {key: "URL", title: "External URL"};
    var pdfType = {key: "PDF", title: "PDF Document"};
    self.types = [pdfType, urlType];

    if (self.categories == null) {
        profileService.getCategories().then(function (data) {
            self.categories = data.resp;
        });
    }

    self.metadata = angular.isDefined(attachment) ? _.clone(attachment) : {};
    self.files = null;
    self.error = null;
    self.type = angular.isDefined(attachment.url) && attachment.url ? urlType.key : pdfType.key;

    self.licences = null;

    var orderBy = $filter("orderBy");

    profileService.getLicences().then(function (data) {
        self.licences = orderBy(data, "name");
        if (self.type != urlType.key) {
            self.metadata.licence = self.licences[0].name;
        }
    });

    self.ok = function () {
        var url = "";
        if (self.profileId) {
            url = util.contextRoot() + "/opus/" + self.opusId + "/profile/" + self.profileId + "/attachment";
        } else {
            url = util.contextRoot() + "/opus/" + self.opusId + "/attachment";
        }

        Upload.upload({
            url: url,
            file: self.metadata.uuid || self.type == urlType.key ? null : self.files[0],
            data: self.metadata
        }).success(function () {
            self.metadata = {};
            self.file = null;
            $modalInstance.close();
            $cacheFactory.get('$http').removeAll();
        }).error(function () {
            self.error = "An error occurred while uploading your file."
        });
    };

    self.cancel = function () {
        $modalInstance.dismiss("cancel");
    };

    // reset the metadata when the attachment type changes to ensure we don't carry irrelevant metadata fields across types
    self.typeChanged = function() {
        self.metadata = angular.isDefined(attachment) ? _.clone(attachment) : {};
    };
});
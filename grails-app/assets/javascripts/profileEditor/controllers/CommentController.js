/**
 * Profile comments controller
 */
profileEditor.controller('CommentController', function (profileService, util, config, messageService, $filter) {
    var self = this;

    self.comments = [];
    self.savedComments = [];
    self.currentComment = null;
    self.opusId = util.getEntityId("opus");
    self.profileId = util.getEntityId("profile");

    var orderBy = $filter("orderBy");

    self.readonly = function () {
        return config.readonly;
    };

    self.loadComments = function() {
        var promise = profileService.getComments(self.opusId, self.profileId);
        promise.then(function(data) {
            self.comments = orderBy(data, 'dateCreated');
            self.savedComments = self.comments;
        })
    };

    self.loadComments();

    self.addComment = function() {
        self.currentComment = {text: "", profileUuid: self.profileId}
    };

    self.editComment = function(path) {
        var comment = find(path);
        self.currentComment = angular.copy(comment);
    };

    self.reply = function(parentCommentId) {
        self.currentComment = {text: "", profileUuid: self.profileId, parentCommentId: parentCommentId};
    };

    self.deleteComment = function(path) {
        var confirm = util.confirm("Are you sure you wish to delete this comment?");

        confirm.then(function() {
            var comment = find(path);
            var promise = profileService.deleteComment(self.opusId, self.profileId, comment.uuid);
            promise.then(function() {
                remove(path);
            }, function() {
                messageService.alert("An error occurred while deleting the comment.")
            })
        });
    };

    self.cancel = function() {
        self.currentComment = null;
    };

    self.saveComment = function(path) {
        var promise = null;
        if (self.currentComment.uuid) {
            promise = profileService.updateComment(self.opusId, self.profileId, self.currentComment.uuid, self.currentComment);
        } else {
            promise = profileService.addComment(self.opusId, self.profileId, self.currentComment);
        }
        promise.then(function(data) {
            messageService.success("Comment successfully saved.");

            var comment = null;
            if (self.currentComment.uuid) {
                comment = find(path);
                comment.text = self.currentComment.text;
            } else if (self.currentComment.parentCommentId) {
                comment = find(path);
                if (!comment.children) {
                    comment.children = [];
                }
                comment.children.push(data);
            } else {
                if (!Array.isArray(self.comments)) {
                    self.comments = [];
                    self.savedComments = []
                }
                self.comments.push(data);
                self.savedComments.push(data);
            }

            self.currentComment = null;
        }, function() {
            messageService.alert("An error occurred while saving your comment.");
        })
    };

    function find(path) {
        var array = self.savedComments;
        var comment = null;
        angular.forEach(path, function(index) {
            if (index > array.length-1) {
                index = array.length-1
            }
            comment = array[index];
            if (comment.children) {
                array = orderBy(comment.children, 'dateCreated');
            }
        });
        return comment;
    }

    function remove(path) {
        var array = self.comments;
        var comment = null;

        if (path.length > 1) {
            var lastIndex = path.splice(-1, 1);

            angular.forEach(path, function (index) {
                comment = array[index];

                if (comment.children) {
                    array = comment.children
                }
            });

            comment.children.splice(lastIndex, 1);
        } else {
            let selectedComment = self.savedComments[path[0]]
            let filterdComments = self.comments.filter(i => i !== selectedComment)
            self.comments = filterdComments;

            if (self.comments.length === 0) {
                self.savedComments = [];
            }
        }
    }
});

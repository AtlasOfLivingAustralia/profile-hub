<hr/>
<div ng-controller="CommentController as commentCtrl" class="comments-panel">
    <navigation-anchor anchor-name="{{commentCtrl.readonly() ? 'view_' : 'edit_'}}comments" title="Comments"></navigation-anchor>

    <div class="card" ng-cloak>
        <div class="card-header">
            <div class="row">
                <div class="col-sm-12">
                    <h4 class="section-panel-heading inline">Comments</h4>
                    <p:help help-id="profile.comments" collection-override="${opus?.help?.commentsLink}"/>
                    <span class="float-end small inline"><i class="fa fa-info-circle">&nbsp;</i>Comments can only be seen by profile Reviewers and Editors.</span>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-sm-12">
                    <div ng-repeat="comment in commentCtrl.comments | orderBy:'dateCreated'"
                         ng-init="path = [$index]" class="comment">
                        <hr ng-if="!$first" class="comment-divider"/>
                        <ng-include src="'/profileEditor/commentContent.htm'"></ng-include>
                    </div>

                    <div ng-if="commentCtrl.currentComment && !commentCtrl.currentComment.uuid && !commentCtrl.currentComment.parentCommentId">
                        <label for="commentText" class="screen-reader-label">Comment text</label>
                        <textarea id="commentText" ng-model="commentCtrl.currentComment.text" ckeditor="richTextFullToolbarForComment" required="required"></textarea>

                        <div class="row float-end">
                            <div class="col-sm-12 padding-top-1">
                                <button class="btn btn-primary"
                                        ng-click="commentCtrl.saveComment(path)">Save comment</button>
                                <button class="btn btn-warning" ng-click="commentCtrl.cancel()">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-footer">
            <div class="row">
                <div class="col-md-12">
                    <button class="btn btn-outline-secondary" ng-click="commentCtrl.addComment()"><i
                            class="fa fa-plus"></i>&nbsp;Add comment</button>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="card ${edit?'':'panel-override'}" ng-controller="AttachmentController as attachmentCtrl" ng-cloak
     ng-show="attachmentCtrl.attachments.length > 0 || !profileCtrl.readonly()">
    <navigation-anchor anchor-name="{{profileCtrl.readonly() ? 'view_' : 'edit_'}}Documents" title="Documents" condition="!attachmentCtrl.readonly || attachmentCtrl.attachments.length > 0"></navigation-anchor>
    <div class="card-header" ng-show="${!hideHeading}">
        <div class="row">
            <div class="col-sm-12">
                <h4 class="section-panel-heading">Documents</h4>
            </div>
        </div>
    </div>

    <div class="card-body">
        <div ng-show="!attachmentCtrl.attachments || attachmentCtrl.attachments.length == 0">No documents have been attached to this {{ attachmentCtrl.profileId ? 'profile' : 'collection' }}.</div>
        <div class="" ng-repeat="attachment in attachmentCtrl.attachments">
            <div class="row">
                <div class="col-md-3">
                    <a ng-href="{{attachment.downloadUrl || attachment.url}}" target="_blank"><span
                            class="fa padding-right-1"
                            ng-class="attachment.url ? 'fa-external-link' : 'fa-file-pdf-o'"></span>{{ attachment.title }}
                    </a>
                </div>

                <div class="col-md-6">
                    {{ attachment.description }}
                    <div class="citation" ng-if="attachment.creator || attachment.rightsHolder">
                        <span ng-if="attachment.creator">{{ attachment.creator }}<span
                                ng-if="attachment.createdDate">, {{ attachment.createdDate | date: 'dd/MM/yyyy' }}</span>
                        </span>
                        <span ng-if="attachment.rightsHolder">(&copy; {{ attachment.rightsHolder }})</span>

                    </div>
                </div>

                <div class="col-md-3">
                    <div class="float-end" ng-show="attachment.downloadUrl">
                        <a ng-href="{{attachment.downloadUrl}}" target="_blank"><span
                                class="fa fa-download color--green">&nbsp;Download</span></a>
                        <span class="padding-left-1"><img src="" ng-src="{{attachment.licenceIcon}}"
                                                          alt="{{attachment.licence}}" title="{{attachment.licence}}">
                        </span>
                    </div>
                    <g:if test="${profile ? (edit ? params.isOpusAuthor : false) : params.isOpusAdmin}">
                        <div class="float-end padding-top-1">
                            <a href="" ng-click="attachmentCtrl.editAttachment(attachment)" class="padding-left-1"><span
                                    class="fa fa-edit">&nbsp;Edit</span></a>
                            <a href="" ng-click="attachmentCtrl.deleteAttachment(attachment.uuid)"
                               class="padding-left-1"><span
                                    class="fa fa-trash-o color--red">&nbsp;Delete</span></a>
                        </div>
                    </g:if>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <hr class="" ng-show="!$last"/>
                </div>
            </div>
        </div>
    </div>

    <g:if test="${profile ? (edit ? params.isOpusAuthor : false) : params.isOpusAdmin}">
        <div class="card-footer">
            <div class="row">
                <div class="col-md-12">
                    <button class="btn btn-outline-secondary float-end" ng-click="attachmentCtrl.uploadAttachment()"><i
                            class="fa fa-plus"></i>&nbsp;Add attachment</button>
                </div>
            </div>
        </div>
    </g:if>
</div>


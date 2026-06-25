<div class="panel panel-default" ng-form="OpusForm" ng-cloak>
    <div class="panel-heading">
        <a name="supportingCollections">
            <h4 class="section-panel-heading">Supporting Collections</h4>
            <p:help help-id="opus.edit.supportingCollections"/>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
        <div class="col-md-12">
            <h5>Sharing data with other collections</h5>

            <p>Sharing data with another collection requires administrator approval. The following option allows you to automatically approve all future requests by other collections to access your information.</p>

            <div class="checkbox">
                <label for="autoApprove" class="inline-label">
                    <input id="autoApprove" type="checkbox" name="autoApprove"
                           ng-model="opusCtrl.opus.autoApproveShareRequests" ng-false-value="false">
                    Automatically approve requests to share collection data.
                </label>
            </div>

            <div class="padding-top-1" ng-show="opusCtrl.opus.sharingDataWith.length > 0">
                <p>
                    We have shared our collection with:
                </p>
                <ul>
                    <li ng-repeat="opus in opusCtrl.opus.sharingDataWith">
                        <a href="${request.contextPath}/opus/{{opus.uuid}}" target="_blank">{{ opus.title }}</a>
                        <a class="btn btn-mini btn-link" title="Revoke access"
                           ng-click="opusCtrl.revokeAccessToSupportedCollection(opus.uuid)">
                            <i class="fa fa-thumbs-o-down color--red"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="col-sm-12">
            <hr/>
            <h5>Accessing data from other collections</h5>

            <p>Configure the profile collections to be used to support profile pages. Information from these collections can be included in the profile pages of your collection.</p>

            <div class="checkbox">
                <label for="showLinked" class="inline-label">
                    <input id="showLinked" type="checkbox" name="showLinked"
                           ng-model="opusCtrl.opus.showLinkedOpusAttributes" ng-false-value="false">
                    Show data from supporting collections on the profile pages.
                </label>
            </div>

            <div class="checkbox">
                <label for="allowCopying" class="inline-label">
                    <input id="allowCopying" type="checkbox" name="allowCopying"
                           ng-model="opusCtrl.opus.allowCopyFromLinkedOpus" ng-false-value="false">
                    Allow profile editors to copy data from supporting collections on the profile pages.
                </label>
            </div>

            <ul class="vertical-pad">
                <li ng-repeat="opus in opusCtrl.supportingOpuses">
                    <a href="${request.contextPath}/opus/{{opus.uuid}}" target="_blank">{{ opus.title }}</a>

                    <status-indicator icon-class="fa-flag color--medium-blue"
                                      title="An administrator of {{opus.title}} has been notified of your request to access their data"
                                      ng-show="opus.requestStatus == 'REQUESTED'" text=" Requested"></status-indicator>
                    <status-indicator icon-class="fa-thumbs-up color--green" ng-show="opus.requestStatus == 'ACCEPTED'"
                                      title="An administrator of {{opus.title}} has approved your request to access to their data"
                                      text=" Approved"></status-indicator>
                    <status-indicator icon-class="fa-thumbs-down color--red" ng-show="opus.requestStatus == 'REJECTED'"
                                      title="An administrator of {{opus.title}} has declined your request access to their data"
                                      text=" Declined"></status-indicator>
                    <status-indicator icon-class="fa-thumbs-down color--red" ng-show="opus.requestStatus == 'REVOKED'"
                                      title="An administrator of {{opus.title}} has revoked access to their data"
                                      text=" Revoked"></status-indicator>

                    <a class="btn btn-mini btn-link" title="Remove this collection"
                       ng-click="opusCtrl.removeSupportingOpus($index, 'existing', OpusForm)">
                        <i class="fa fa-trash-o color--red"></i>
                    </a>
                </li>

                <li ng-repeat="opus in opusCtrl.newSupportingOpuses">
                    <div class="form-inline">
                        <div class="form-group">
                            <input placeholder="Collection name..."
                                   ng-model="opus.opus"
                                   autocomplete="off"
                                   size="70"
                                   class="form-control"
                                   typeahead-on-select="opusCtrl.supportingOpusSelected($item)"
                                   typeahead="opus as opus.title for opus in opusCtrl.opusList | filter:$viewValue | limitTo:10"/>
                            <button class="btn btn-mini btn-link" title="Remove this collection"
                                    ng-click="opusCtrl.removeSupportingOpus($index, 'new', OpusForm)">
                                <i class="fa fa-trash-o color--red"></i>
                            </button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        </div>
    </div>

    <div class="panel-footer">
        <div class="row">
            <div class="col-md-12">
                <div class="btn-group">
                    <button class="btn btn-outline-secondary" ng-click="opusCtrl.addSupportingOpus()"><i
                            class="fa fa-plus"></i>  Add collection</button>
                </div>
                <save-button ng-click="opusCtrl.saveSupportingOpuses(OpusForm)" form="OpusForm"></save-button>
            </div>
        </div>
    </div>
</div>
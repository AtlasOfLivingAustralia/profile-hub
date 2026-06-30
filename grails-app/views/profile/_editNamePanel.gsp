<div  ng-show="profileCtrl.showNameEditControls" class="padding-top-1" ng-cloak>
    <div class="row">
        <div class="float-start padding-left-1">
            <span class="status small" ng-class="profileCtrl.profile.matchedName ? 'green' : 'red'" title="The name has{{ profileCtrl.profile.matchedName ? '' : ' not' }} been matched against the ALA">ALA</span>
            <span class="status small" ng-class="profileCtrl.profile.nslNameIdentifier ? 'green' : 'red'"title="The name has{{ profileCtrl.profile.nslNameIdentifier ? '' : ' not' }} been matched against the NSL">NSL</span>
        </div>
        <div class="float-end">
            <a href="" class="close-edit-name" ng-click="profileCtrl.editName()"
                    ng-show="!profileCtrl.readonly()"><span class="fa fa-close">&nbsp;</span>Close</a>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-md-12">
                    <p>
                        Current matched name: <span data-ng-bind-html="profileCtrl.profile.matchedName.formattedName | default: 'Not matched' | sanitizeHtml"></span>
                        <span ng-show="profileCtrl.profile.manuallyMatchedName">(manually matched by the editor)</span>
                        <p:help help-id="profile.edit.name"  collection-override="${opus?.help?.nameMatchLink}"/>
                    </p>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <profile-name name="profileCtrl.newName"
                                  valid="profileCtrl.nameIsValid"
                                  current-profile-id="profileCtrl.profile.uuid"
                                  manual-hierarchy="profileCtrl.manualHierarchy"
                                  edit-mode="true"
                                  manually-matched-guid="profileCtrl.manuallyMatchedGuid"></profile-name>
                </div>
            </div>
        </div>

        <div class="card-footer">
            <div class="row">
                <div class="col-md-12">
                    <div class="float-end">
                        <button class="btn btn-outline-secondary" ng-show="profileCtrl.profile.matchedName" ng-click="profileCtrl.clearNameMatch()">Remove matched name</button>
                        <button class="btn btn-primary" ng-disabled="!profileCtrl.nameIsValid" ng-click="profileCtrl.saveNameChange()">Update name</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
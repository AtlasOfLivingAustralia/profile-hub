<div class="card" ng-form="ProfileEditForm" ng-cloak>
    <div class="card-header">
        <a name="profileEditing">
            <h4 class="section-panel-heading">Profile editing options</h4>
            <p:help help-id="opus.edit.profileEditingOptions"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="checkbox">
                    <label for="autoDraftProfiles" class="inline-label">
                        <input id="autoDraftProfiles" type="checkbox" name="autoDraftProfiles"
                               ng-model="opusCtrl.opus.autoDraftProfiles" ng-false-value="false">
                        Automatically lock new profiles for major revision.
                    </label>
                </div>
            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(ProfileEditForm)" form="ProfileEditForm"></save-button>
            </div>
        </div>
    </div>
</div>

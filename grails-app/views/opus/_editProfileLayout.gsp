<div class="panel panel-default" ng-form="opusCtrl.ProfileLayoutForm" ng-cloak>
    <div class="panel-heading">
        <a name="profileLayout">
            <h4 class="section-panel-heading">Profile Page Layout</h4>
            <p:help help-id="opus.edit.profilePageLayout"/>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="form-group">
                    <label>Basic Page Layout</label>
                    <select ng-options="layout.name as layout.displayText for layout in opusCtrl.profilePageLayouts | orderBy:'name'"
                            ng-model="opusCtrl.opus.profileLayoutConfig.layout" class="form-control">
                    </select>

                    <p ng-show="opusCtrl.opus.profileLayoutConfig.layout" class="padding-top-1"
                       ng-repeat="layout in opusCtrl.profilePageLayouts | filter:{name: opusCtrl.opus.profileLayoutConfig.layout}:true">
                        {{ layout.description }}
                    </p>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="checkbox">
                <label for="showQRCode" class="inline-label">
                    <input id="showQRCode"
                           type="checkbox"
                           name="showQRCode"
                           ng-model="opusCtrl.opus.profileLayoutConfig.showQRCode"
                           ng-false-value="false">
                    Show QR code on profile pages
                </label>
            </div>
            <p class="help-block">
                Display a QR code linking to the permanent profile URL
                at the bottom of each profile page.
            </p>
        </div>
    </div>

    <div class="panel-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(opusCtrl.ProfileLayoutForm)" form="opusCtrl.ProfileLayoutForm"></save-button>
            </div>
        </div>
    </div>
</div>
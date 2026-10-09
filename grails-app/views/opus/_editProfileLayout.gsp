<div class="card" ng-form="opusCtrl.ProfileLayoutForm" ng-cloak>
    <div class="card-header">
        <a name="profileLayout">
            <h4 class="section-panel-heading">Profile Page Layout</h4>
            <p:help help-id="opus.edit.profilePageLayout"/>
        </a>
    </div>

    <div class="card-body">
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
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(opusCtrl.ProfileLayoutForm)" form="opusCtrl.ProfileLayoutForm"></save-button>
            </div>
        </div>
    </div>
</div>
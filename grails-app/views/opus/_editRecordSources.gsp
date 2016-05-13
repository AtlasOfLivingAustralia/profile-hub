<div class="panel panel-default dirty-check-container" ng-form="RecordForm" ng-cloak>
    <div class="panel-heading">
        <a name="recordSources">
            <h4 class="section-panel-heading">Approved Specimen/Observation sources</h4>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                <p>
                    Configure the record sources to be included in your profile pages. This controls the data that will be retrieved from the Atlas of Living Australia to be used on maps and in data lookups.
                </p>

                <p>
                    Use the options below to select which data resources to use.
                </p>

                 <div class="radio">
                    <label ng-repeat="(key, value) in opusCtrl.collectoryResourceOptions | orderBy: 'value'" class="inline-label padding-right-1">
                        <input type="radio" name="{{key}}" ng-value="key" ng-model="opusCtrl.opus.dataResourceConfig.recordResourceOption" ng-change="opusCtrl.recordSourceOptionChanged()">
                        {{value}}
                    </label>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.recordResourceOption == 'ALL'">
                    <p>
                        <span class="fa fa-info-circle padding-left-1">&nbsp;</span>This option will retrieve records from all available data resources in the Atlas of Living Australia.
                    </p>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.recordResourceOption == 'NONE'">
                    <p class="padding-left-1">
                        <span class="fa fa-info-circle">&nbsp;</span>Every collection has its own data resource in the Atlas of Living Australia. This option will limit records to that resource only.
                    </p>
                    <p class="padding-left-1">
                        The name of your collection's data resource is <a href="${grailsApplication.config.collectory.base.url}/public/show/{{opusCtrl.dataResource.uid}}" target="_blank" title="Click to visit your collection resource's page in the Atlas of Living Australia">{{opusCtrl.dataResource.name}}</a>.
                    </p>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.recordResourceOption == 'HUBS'">
                    <div ng-show="opusCtrl.recordHubMultiSelectOptions.loading">
                        <span class="fa fa-spin fa-spinner">&nbsp;&nbsp;</span>Loading...
                    </div>
                    <div ng-hide="opusCtrl.recordHubMultiSelectOptions.loading">
                        <dualmultiselect options="opusCtrl.recordHubMultiSelectOptions"></dualmultiselect>
                        <alert class="alert-danger" ng-hide="opusCtrl.isRecordSourceSelectionValid()">You must select at least 1 resource</alert>
                    </div>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.recordResourceOption == 'RESOURCES'">
                    <div ng-show="opusCtrl.recordResourceMultiSelectOptions.loading">
                        <span class="fa fa-spin fa-spinner">&nbsp;&nbsp;</span>Loading...
                    </div>
                    <div ng-hide="opusCtrl.recordResourceMultiSelectOptions.loading">
                        <dualmultiselect options="opusCtrl.recordResourceMultiSelectOptions"></dualmultiselect>
                        <alert class="alert-danger" ng-hide="opusCtrl.isRecordSourceSelectionValid()">You must select at least 1 resource</alert>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="panel-footer">
        <div class="row">
            <div class="col-md-12">
                <div class="btn-group">
                    <button class="btn btn-default" ng-click="opusCtrl.resetRecordSources()">Reset</button>
                </div>
                <save-button ng-click="opusCtrl.saveOpus(RecordForm)" disabled="!opusCtrl.isRecordSourceSelectionValid()" form="RecordForm"></save-button>
            </div>
        </div>
    </div>

</div>
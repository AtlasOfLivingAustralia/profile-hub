<div class="panel panel-default" ng-form="ImageForm" ng-cloak>
    <div class="panel-heading">
        <a name="imageSources">
            <h4 class="section-panel-heading">Image options</h4>
        </a>
        <p:help help-id="opus.edit.images"/>
    </div>

    <div class="panel-body">
        <div class="row">

            <div class="col-sm-12">
                <h5 class="section-panel-heading padding-bottom-1">Approved image sources</h5>
                <p>Configure additional image sources to be included in your profile pages. These are image libraries from the Atlas of Living Australia.</p>

                <div class="col-sm-6">
                    <div class="radio">
                        <label for="includeImages" class="inline-label">
                            <input id="includeImages" type="radio" name="approvedImageOption" ng-value="'INCLUDE'"
                                   ng-model="opusCtrl.opus.approvedImageOption">
                            Display all images from the approved image sources in profiles unless the Profile Editor explicitly chooses not to show them.
                        </label>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="radio">
                        <label for="excludeImages" class="inline-label">
                            <input id="excludeImages" type="radio" name="approvedImageOption" ng-value="'EXCLUDE'"
                                   ng-model="opusCtrl.opus.approvedImageOption">
                            Only display images from approved image sources where the Profile Editor has explicitly chosen to show them.
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="col-sm-12">
                <h6 class="section-panel-heading padding-bottom-1">Selected image sources</h6>
                <p>
                    Use the options below to select which data resources to use.
                </p>

                <div class="radio">
                    <label ng-repeat="(key, value) in opusCtrl.collectoryResourceOptions | orderBy: 'value'" class="inline-label padding-right-1">
                        <input type="radio" name="image{{key}}" ng-value="key" ng-model="opusCtrl.opus.dataResourceConfig.imageResourceOption" ng-change="opusCtrl.imageSourceOptionChanged()">
                        {{value}}
                    </label>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.imageResourceOption == 'ALL'">
                    <p>
                        <span class="fa fa-info-circle padding-left-1">&nbsp;</span>This option will retrieve images from all available data resources in the Atlas of Living Australia.
                    </p>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.imageResourceOption == 'NONE'">
                    <p class="padding-left-1">
                        <span class="fa fa-info-circle">&nbsp;</span>Every collection has its own data resource in the Atlas of Living Australia. This option will limit images to that resource only.
                    </p>
                    <p class="padding-left-1">
                        The name of your collection's data resource is <a href="${grailsApplication.config.collectory.base.url}/public/show/{{opusCtrl.dataResource.uid}}" target="_blank" title="Click to visit your collection resource's page in the Atlas of Living Australia">{{opusCtrl.dataResource.name}}</a>.
                    </p>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.imageResourceOption == 'HUBS'">
                    <div ng-show="opusCtrl.imageHubMultiSelectOptions.loading">
                        <span class="fa fa-spin fa-spinner">&nbsp;&nbsp;</span>Loading...
                    </div>
                    <div ng-hide="opusCtrl.imageHubMultiSelectOptions.loading">
                        <dualmultiselect options="opusCtrl.imageHubMultiSelectOptions"></dualmultiselect>
                        <alert class="alert-danger" ng-hide="opusCtrl.isImageSourceSelectionValid()">You must select at least 1 resource</alert>
                    </div>
                </div>

                <div ng-show="opusCtrl.opus.dataResourceConfig.imageResourceOption == 'RESOURCES'">
                    <div ng-show="opusCtrl.imageResourceMultiSelectOptions.loading">
                        <span class="fa fa-spin fa-spinner">&nbsp;&nbsp;</span>Loading...
                    </div>
                    <div ng-hide="opusCtrl.imageResourceMultiSelectOptions.loading">
                        <dualmultiselect options="opusCtrl.imageResourceMultiSelectOptions"></dualmultiselect>
                        <alert class="alert-danger" ng-hide="opusCtrl.isImageSourceSelectionValid()">You must select at least 1 resource</alert>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="panel-footer">
        <div class="row">
            <div class="col-md-12">
                <div class="btn-group">
                    <button class="btn btn-default" ng-click="opusCtrl.resetImageSources()">Reset</button>
                </div>
                <save-button ng-click="opusCtrl.saveOpus(ImageForm)" disabled="!opusCtrl.isImageSourceSelectionValid()" form="ImageForm"></save-button>
            </div>
        </div>
    </div>
</div>
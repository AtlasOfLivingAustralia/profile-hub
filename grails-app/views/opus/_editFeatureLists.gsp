<div class="panel panel-default" ng-form="FeatureFrom" ng-cloak>
    <div class="panel-heading">
        <a name="featureLists">
            <h4 class="section-panel-heading">Feature Lists</h4>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                <p>Configure the list(s) to be used to retrieve additional features for your profiles from the Atlas of Living Australia's List Tool. These lists can include such information as naturalised status, pest status, characters, traits, and so on.</p>

                <p>Using the <a href="${grailsApplication.config.lists.base.url}"
                                target="_blank">Atlas of Living Australia Lists Tool</a>, upload a Species List as a .csv file, where the first column is "scientific_name" (this must match the name of your profile, excluding author information), plus a separate column for each status you wish to display.
                </p>
            </div>

            <div class="col-sm-12">
                <div class="form-group">
                    <label for="sectionName">Section title</label>
                    <input id="sectionName" type="text" class="form-control" name="sectionName"
                           ng-model="opusCtrl.opus.featureListSectionName"><br/>
                    <span class="small">The heading for the section on the profile view page (defaults to 'Feature List').</span>
                </div>
            </div>

            <div class="col-sm-12">
                <label for="lists">Selected Lists</label>

                <ul id="lists">
                    <li ng-repeat="feature in opusCtrl.opus.featureLists">
                        <a href="${grailsApplication.config.lists.base.url}/speciesListItem/list/{{feature}}">{{(opusCtrl.allSpeciesLists | filter: feature)[0].listName | default:'Loading...'}}</a>
                        <a class="btn btn-mini btn-link" title="Remove this resource"
                           ng-click="opusCtrl.removeFeatureList($index, 'existing', FeatureFrom)">
                            <i class="fa fa-trash-o color--red"></i>
                        </a>
                    </li>

                    <li ng-repeat="feature in opusCtrl.newFeatureLists">
                        <div class="form-inline">
                            <div class="form-group">
                                <input placeholder="List name..."
                                       ng-model="feature.list"
                                       autocomplete="off" size="70"
                                       class="form-control"
                                       typeahead="list as list.listName for list in opusCtrl.allSpeciesLists | filter:$viewValue | limitTo:10"/>
                                <span class="fa fa-ban color--red"
                                      ng-if="feature.list && !feature.list.dataResourceUid"></span>
                                <button class="btn btn-mini btn-link" title="Remove this resource"
                                        ng-click="opusCtrl.removeFeatureList($index, 'new', FeatureFrom)">
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
                    <button class="btn btn-default" ng-click="opusCtrl.addFeatureList()"><i
                            class="fa fa-plus"></i>  Add list</button>
                </div>
                <button class="btn btn-primary pull-right" ng-click="opusCtrl.saveFeatureLists(FeatureFrom)">
                    <span ng-show="!opusCtrl.saving" id="saved"><span ng-show="FeatureFrom.$dirty">*</span> Save
                    </span>
                    <span ng-show="opusCtrl.saving" id="saving">Saving....</span>
                </button>
            </div>
        </div>
    </div>
</div>
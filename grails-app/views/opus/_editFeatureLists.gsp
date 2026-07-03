<div class="card" ng-form="FeatureForm" ng-cloak>
    <div class="card-header">
        <a name="featureLists">
            <h4 class="section-panel-heading">Feature Lists</h4>
            <p:help help-id="opus.edit.featureLists"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <p>Configure the list(s) to be used to retrieve additional features for your profiles from the Atlas of Living Australia's List Tool. These lists can include such information as naturalised status, pest status, characters, traits, and so on.</p>

                <p>Using the <a href="${grailsApplication.config.lists.ui.url}"
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
                        <a href="${grailsApplication.config.lists.ui.url}/speciesListItem/list/{{feature}}">{{(opusCtrl.allSpeciesLists | filter: feature)[0].listName | default:'Loading...'}}</a>
                        <a class="btn btn-mini btn-link" title="Remove this resource"
                           ng-click="opusCtrl.removeFeatureList($index, 'existing', FeatureForm)">
                            <i class="fa fa-trash-o color--red"></i>
                        </a>
                    </li>

                    <li ng-repeat="feature in opusCtrl.newFeatureLists">
                        <div class="d-flex align-items-center gap-2">
                            <div class="form-group">
                                <input placeholder="List name..."
                                       ng-model="feature.list"
                                       autocomplete="off" size="70"
                                       class="form-control"
                                       typeahead="list as list.listName for list in opusCtrl.allSpeciesLists | filter:$viewValue | limitTo:10"/>
                                <span class="fa fa-ban color--red"
                                      ng-if="feature.list && !feature.list.dataResourceUid"></span>
                                <button class="btn btn-mini btn-link" title="Remove this resource"
                                        ng-click="opusCtrl.removeFeatureList($index, 'new', FeatureForm)">
                                    <i class="fa fa-trash-o color--red"></i>
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <div class="btn-group">
                    <button class="btn btn-outline-secondary" ng-click="opusCtrl.addFeatureList()"><i
                            class="fa fa-plus"></i>  Add list</button>
                </div>
                <save-button ng-click="opusCtrl.saveFeatureLists(FeatureForm)" form="FeatureForm"></save-button>
            </div>
        </div>
    </div>
</div>

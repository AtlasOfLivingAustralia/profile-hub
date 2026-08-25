<div class="card" ng-form="OpusDetailsForm" ng-cloak>
    <div class="card-header">
        <a name="overview">
            <h4 class="section-panel-heading">Site overview</h4>
            <p:help help-id="opus.edit.siteOverview"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="form-group">
                    <label for="opusName">Title</label>
                    <input type="text"
                           id="opusName"
                           class="form-control"
                           name="opusName"
                           ng-required="true"
                           ng-model="opusCtrl.opus.title"/>
                </div>

                <div class="form-group" ng-show="!opusCtrl.opus.uuid">
                    <label for="dataResource">Atlas of Living Australia Resource</label>
                    <input type="text"
                           id="dataResource"
                           class="form-control"
                           name="opusName"
                           ng-model="opusCtrl.dataResource"
                           ng-required="true"
                           typeahead-editable="false"
                           typeahead-on-select="opusCtrl.opusResourceChanged($item, $model, $label)"
                           typeahead="source as source.name for source in opusCtrl.opusDataResourceList | filter:$viewValue | limitTo:10"/>
                    <span class="small">This allows data from Atlas of Living Australia (such as occurrence maps) to be included in your profiles.</span>
                    <alert type="danger"
                           ng-show="!opusCtrl.dataResource">You must select a value from the list.</alert>
                </div>

                <div class="form-group">
                    <label>Description</label>

                    <textarea id="description" ng-model="opusCtrl.opus.description" rows="4"
                              class="form-control" ng-maxlength="300" maxlength="300"></textarea>
                </div>

            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <h5>Tags</h5>
                <label>
                    Select tags that help to describe your collection
                </label>
                <select ng-options="tag.name for tag in opusCtrl.tags | orderBy:'name'" ng-model="opusCtrl.selectedTag"
                        ng-change="opusCtrl.tagSelected(OpusDetailsForm)" class="form-control">
                    <option value="">--- Select one ---</option>
                </select>
            </div>

            <div class="col-md-12">
                <tag ng-repeat="tag in opusCtrl.opus.tags" tag="tag" locked="false" remove="opusCtrl.removeTag"
                     form="OpusDetailsForm"></tag>
            </div>
        </div>

    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(OpusDetailsForm)" disabled="!opusCtrl.dataResource.uid" form="OpusDetailsForm"></save-button>
            </div>
        </div>
    </div>
</div>
<div class="card" ng-form="ListForm" ng-cloak>
    <div class="card-header">
        <a name="lists">
            <h4 class="section-panel-heading">Approved Lists</h4>
            <p:help help-id="opus.edit.lists"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <p>Configure the species lists to be included in your profile pages.</p>

                <ul>
                    <li ng-repeat="approvedList in opusCtrl.opus.approvedLists">
                        <a href="${grailsApplication.config.lists.ui.url}/speciesListItem/list/{{approvedList}}">{{(opusCtrl.allSpeciesLists | filter: approvedList)[0].listName | default:'Loading...'}}</a>
                        <a class="btn btn-mini btn-link" title="Remove this resource"
                           ng-click="opusCtrl.removeApprovedList($index, 'existing', ListForm)">
                            <i class="fa fa-trash-o color--red"></i>
                        </a>
                    </li>

                    <li ng-repeat="approvedList in opusCtrl.newApprovedLists">
                        <div class="form-inline">
                            <div class="form-group">
                                <input placeholder="List name..."
                                       ng-model="approvedList.list"
                                       autocomplete="off" size="70"
                                       class="form-control"
                                       typeahead="list as list.listName for list in opusCtrl.allSpeciesLists | filter:$viewValue | limitTo:10"/>
                                <span class="fa fa-ban color--red"
                                      ng-if="approvedList.list && !approvedList.list.dataResourceUid"></span>
                                <button class="btn btn-mini btn-link" title="Remove this resource"
                                        ng-click="opusCtrl.removeApprovedList($index, 'new', ListForm)">
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
                    <button class="btn btn-outline-secondary" ng-click="opusCtrl.addApprovedList()"><i
                            class="fa fa-plus"></i>  Add list</button>
                </div>
                <save-button ng-click="opusCtrl.saveApprovedLists(ListForm)" form="ListForm"></save-button>
            </div>
        </div>
    </div>
</div>

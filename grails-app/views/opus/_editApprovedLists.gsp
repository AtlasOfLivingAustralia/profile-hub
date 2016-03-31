<div class="panel panel-default" ng-form="ListForm" ng-cloak>
    <div class="panel-heading">
        <a name="lists">
            <h4 class="section-panel-heading">Approved Lists</h4>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                <p>Configure the species lists to be included in your profile pages. If you do not approve any specific lists, then all lists will be considered.</p>

                <ul>
                    <li ng-repeat="approvedList in opusCtrl.opus.approvedLists">
                        <a href="${grailsApplication.config.lists.base.url}/speciesListItem/list/{{approvedList}}">{{(opusCtrl.allSpeciesLists | filter: approvedList)[0].listName | default:'Loading...'}}</a>
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

    <div class="panel-footer">
        <div class="row">
            <div class="col-md-12">
                <div class="btn-group">
                    <button class="btn btn-default" ng-click="opusCtrl.addApprovedList()"><i
                            class="fa fa-plus"></i>  Add list</button>
                </div>
                <save-button ng-click="opusCtrl.saveApprovedLists(ListForm)" form="ListForm"></save-button>
            </div>
        </div>
    </div>
</div>

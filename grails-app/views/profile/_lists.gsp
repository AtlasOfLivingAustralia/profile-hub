<div ng-controller="ListsEditor as listCtrl" ng-init="listCtrl.init('${edit}')">
    <navigation-anchor anchor-name="{{listCtrl.readonly ? 'view_' : 'edit_'}}lists" title="Conservation & Sensitivity Lists" condition="listCtrl.lists.length > 0"></navigation-anchor>

    <div class="panel panel-default ${edit?'':'panel-override'}" ng-show="listCtrl.lists.length > 0">
        <div class="panel-heading">
            <div class="row">
                <div class="col-md-12">
                    <h4 class="section-panel-heading">Conservation & sensitivity lists</h4>
                    <p:help help-id="profile.edit.conservationLists" show="${edit}"  collection-override="${opus?.help?.conservationSensitivityListsLink}"/>
                </div>
            </div>
        </div>

        <div class="panel-body">
            <div class="row">
                <div class="col-md-12">
                    <ul>
                        <li ng-repeat="list in listCtrl.lists">
                            <a href="${grailsApplication.config.lists.ui.url}/speciesListItem/list/{{ list.dataResourceUid }}">{{ list.list.listName }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div class="panel panel-default ${edit?'':'panel-override'}" ng-show="listCtrl.conservationStatuses.length > 0">
        <navigation-anchor anchor-name="{{listCtrl.readonly ? 'view_' : 'edit_'}}conservationStatus" title="Conservation Status" condition="listCtrl.conservationStatuses.length > 0"></navigation-anchor>
        <div class="panel-heading">
            <div class="row">
                <div class="col-md-12">
                    <h4 class="section-panel-heading">Conservation status</h4>
                </div>
            </div>
        </div>

        <div class="panel-body">
            <div class="row section-no-para" ng-repeat="status in listCtrl.conservationStatuses">
                <div class="col-md-4">
                    <a href="${grailsApplication.config.collectory.base.url}/public/showDataResource/{{listCtrl.statusRegions[status.region].id}}"
                       title="Threatened Species Codes - details" target="_blank">
                        <div class="status"
                             ng-class="listCtrl.getColourForStatus(status.status)">{{listCtrl.statusRegions[status.region].abbrev | default:'IUCN'}}</div>
                        {{status.rawStatus}}
                    </a>
                </div>
                <div class="col-md-8 padding-top-1">
                    <span class="citation small"><a ng-href="status.infoSourceURL" title="{{ status.infoSourceName }}" target="_blank">{{ status.infoSourceName }}</a></span>
                </div>
            </div>
            <div class="small">
                <span class="pull-right"><i class="fa fa-info-circle">&nbsp;</i>Click the symbols to view additional information</span>
            </div>
        </div>
    </div>

    <div class="panel panel-default ${edit?'':'panel-override'}" ng-show="listCtrl.hasFeatures">
        <navigation-anchor anchor-name="{{listCtrl.readonly ? 'view_' : 'edit_'}}features" title="{{listCtrl.opus.featureListSectionName || 'Feature List'}}" condition="listCtrl.hasFeatures"></navigation-anchor>
        <div class="panel-heading">
            <div class="row">
                <div class="col-md-12">
                    <h4 class="section-panel-heading">{{ listCtrl.opus.featureListSectionName | default:'Feature List' }}</h4>
                    <p:help help-id="profile.edit.featureLists" show="${edit}" collection-override="${opus?.help?.featureListsLink}"/>
                </div>
            </div>
        </div>

        <div class="panel-body">
            <div ng-repeat="list in listCtrl.featureLists" ng-show="list.items.length > 0">
                <div class="row section-no-para padding-bottom-1" ng-show="list.metadata">
                    <div class="col-md-12">
                        <span class="citation">
                            From the <a ng-href="${grailsApplication.config.ala.lists.ui.url}/speciesListItem/list/{{ list.metadata.dataResourceUid }}">{{ list.metadata.listName }}</a> species list, created by {{ list.metadata.fullName }} on {{ list.metadata.dateCreated | date }}.
                        </span>
                    </div>
                </div>
                <div class="row section-no-para" ng-repeat="feature in list.items">
                    <div class="col-md-3 minor-heading">{{feature.key | formatText | capitalize}}</div>

                    <div class="col-md-9">
                        {{feature.value  | formatText}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
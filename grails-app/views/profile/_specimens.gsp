<div class="card" ng-controller="SpecimenController as specCtrl" ng-cloak ng-form="SpecimenForm"
     ng-show="specCtrl.specimens.length > 0 || !specCtrl.readonly()">
    <navigation-anchor anchor-name="{{profileCtrl.readonly() ? 'view_' : 'edit_'}}specimens" title="Specimens" condition="profileCtrl.profile.specimenIds && profileCtrl.profile.specimenIds.length > 0 || !profileCtrl.readonly()"></navigation-anchor>

    <div class="card-header">
        <div class="row">
            <div class="col-sm-12">
                <h4 class="section-panel-heading">Specimens</h4>
                <p:help help-id="profile.edit.specimens" show="${edit}" collection-override="${opus?.help?.specimensLink}"/>
            </div>
        </div>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12" ng-if="!specCtrl.readonly()">
                <p>
                    <p>Add links to specimen pages. Links should be of the form:
                    <br/><b>http://biocache.ala.org.au/occurrences/e0fd3aca-7b21-44de-abe4-6b392cd32aae</b></p>
                </p>
                <hr/>
            </div>
        </div>

        <div class="row" ng-repeat="specimen in specCtrl.specimens" ng-class="{'margin-bottom-1': $last}">
            <div ng-class="{'col-sm-12':specCtrl.readonly(), 'col-sm-10':!specCtrl.readonly()}">
                <div ng-if="!specCtrl.readonly() && !specimen.saved">
                    <div class="form-group">
                        <label>URL</label>
                        <div class="input-group">
                            <input type="text" class="form-control" ng-model="specimen.url"/><br/>
                                <button class="btn btn-success" type="button" ng-click="specCtrl.checkAddedSpecimen($index, specimen.url)"><span class="fa fa-check color--white"></span></button>
                        </div>
                        <alert type="danger" ng-if="specimen.error">{{ specimen.error }}</alert>
                    </div>
                </div>

                <div ng-if="specimen.institutionName"><span class="minor-heading">Institution Name:&nbsp;</span><a
                        href="${grailsApplication.config.collectory.base.url}/public/show/{{specimen.institutionUid}}"
                        target="_blank">{{specimen.institutionName}}</a></div>

                <div ng-if="specimen.collectionName"><span class="minor-heading">Collection:&nbsp;</span><a
                        href="${grailsApplication.config.collectory.base.url}/public/show/{{specimen.collectionUid}}"
                        target="_blank">{{specimen.collectionName}}</a></div>

                <div ng-if="specimen.catalogNumber"><span class="minor-heading">Catalog Number:&nbsp;</span>{{specimen.catalogNumber}}
                </div>

                <div ng-if="specimen.id"><a
                        href="${grailsApplication.config.biocache.base.url}/occurrences/{{specimen.id}}"
                        target="_blank">View specimen record</a></div>
            </div>
            <div class="col-sm-2 text-right" ng-if="!specCtrl.readonly()">
                <button class="btn btn-danger"
                        ng-click="specCtrl.deleteSpecimen($index, SpecimenForm)">Delete</button>
            </div>
            <div class="col-sm-12" ng-if="!$last">
                <hr/>
            </div>
        </div>
    </div>

    <div class="card-footer" ng-if="!specCtrl.readonly()">
        <div class="row">
            <div class="col-md-12">
                <button class="btn btn-outline-secondary" ng-click="specCtrl.addSpecimen(SpecimenForm)"><i
                        class="fa fa-plus"></i> Add Specimen</button>
                <save-button ng-click="specCtrl.save(SpecimenForm)" form="SpecimenForm"
                        disabled="!specCtrl.isValid()"></save-button>
            </div>
        </div>
    </div>
</div>

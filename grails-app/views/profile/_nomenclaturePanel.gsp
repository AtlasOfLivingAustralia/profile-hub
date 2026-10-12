<div class="card ${edit?'':'panel-override'}" ng-cloak ng-form="NomenclatureForm"
     ng-show="profileCtrl.profile.nslNomenclatureIdentifier || !profileCtrl.readonly()">
    <navigation-anchor anchor-name="{{profileCtrl.readonly() ? 'view_' : 'edit_'}}nomenclature" condition="profileCtrl.profile.nslNomenclatureIdentifier || !profileCtrl.readonly()" title="Nomenclature"></navigation-anchor>
    <div class="card-header">
        <div class="row">
            <div class="col-sm-12">
                <h4 class="section-panel-heading">Nomenclature</h4>
                <p:help help-id="profile.edit.nomenclature" show="${edit}" collection-override="${opus?.help?.nomenclatureLink}"/>
            </div>
        </div>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <nomenclature nsl-name-id="profileCtrl.profile.nslNameIdentifier"
                              nsl-nomenclature-id="profileCtrl.profile.nslNomenclatureIdentifier"
                              readonly="{{profileCtrl.readonly()}}"
                              save-function="profileCtrl.saveProfile"></nomenclature>
            </div>
        </div>
    </div>

    <div class="card-footer" ng-if="!profileCtrl.readonly()">
        <div class="row">
            <div class="col-md-12">
                <div class="float-end">
                    <save-button ng-click="profileCtrl.saveProfile(NomenclatureForm)" form="NomenclatureForm"></save-button>
                </div>
            </div>
        </div>
    </div>
</div>
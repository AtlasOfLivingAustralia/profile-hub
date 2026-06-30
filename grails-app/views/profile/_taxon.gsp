<div class="card ${edit?'':'panel-override'}" ng-cloak ng-show="profileCtrl.profile.classification.length > 0">
    <navigation-anchor anchor-name="{{profileCtrl.readonly() ? 'view_' : 'edit_'}}taxon" title="Taxonomy" condition="profileCtrl.profile.classification.length > 0"></navigation-anchor>

    <div class="card-header">
        <div class="row">
            <div class="col-sm-12">
                <h4 class="section-panel-heading">Taxonomy <span ng-show="profileCtrl.profile.taxonomyTree"> from {{ profileCtrl.profile.taxonomyTree }}</span></h4>
                <p:help help-id="profile.edit.taxonomy" show="${edit}" collection-override="${opus?.help?.taxonomyLink}"/>
            </div>
        </div>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <taxonomy data="profileCtrl.profile.classification" opus-id="profileCtrl.opusId"
                          include-rank="true" show-children="true" show-infraspecific="true" show-with-profile-only="false"></taxonomy>
            </div>
        </div>
    </div>
</div>

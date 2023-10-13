<div class="panel panel-default" ng-controller="PublicationController as pubCtrl"
     ng-cloak id="browse_lists"
     ng-show="pubCtrl.publications.length > 0 || !pubCtrl.readonly()"
     ng-form="PubForm">
    <navigation-anchor anchor-name="{{pubCtrl.readonly() ? 'view_' : 'edit_'}}publications" title="Versions" condition="pubCtrl.publications.length > 0 || !pubCtrl.readonly()"></navigation-anchor>

    <div class="panel-heading">
        <div class="row">
            <div class="col-sm-12">
                <h4 class="section-panel-heading">Versions</h4>
                <p:help help-id="profile.edit.versions" show="${edit}" collection-override="${opus?.help?.versionsLink}"/>
            </div>
        </div>
    </div>

    <div class="panel-body">
    <g:if test="${params.isOpusAuthor && grailsApplication.config.feature?.publications == 'false'}">
        <alert type="warning">Snapshot versioning has been temporarily disabled.</alert>
    </g:if>
    <div class="row section-no-para">
            <div class="col-sm-12" ng-repeat="pub in pubCtrl.publications">
                <publication data="pub" opus-id="pubCtrl.opusId" profile-id="pubCtrl.profileId"  prefix="${grailsApplication.config.doi.resolver.prefix}">
                </publication>
                <hr ng-if="!$last"/>
            </div>
        </div>
    </div>
</div>

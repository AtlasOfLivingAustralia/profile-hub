<div class="row">
    <div class="col-md-9" ng-cloak>
        <h2 class="heading-large inline"><span
                data-ng-bind-html="profileCtrl.formatName() | default:'Loading...' | sanitizeHtml"></span></h2>

        <div class="margin-bottom-1 inline-block small" ng-show="profileCtrl.opus">
            <a href="${grailsApplication.config.bie.base.url}/species/{{ profileCtrl.profile.guid }}"
               ng-show="profileCtrl.profile.guid" title="View this taxon in the Atlas of Living Australia"
               class="padding-left-1" target="_blank"><span class="fa fa-search">&nbsp;</span>ALA</a>
            <a href="${grailsApplication.config.nsl.base.url}services/apni-format/display/{{ profileCtrl.profile.nslNameIdentifier }}"
               ng-show="profileCtrl.profile.nslNameIdentifier"
               title="View this name in the National Species List" class="padding-left-1" target="_blank"><span
                    class="fa fa-search">&nbsp;</span>NSL <span
                    ng-show="profileCtrl.nslNameStatus">[{{profileCtrl.nslNameStatus}}]</span></a>
        </div>
    </div>

    <div class="col-md-3 text-right" ng-cloak>
        <g:render template="optionsMenu"/>
    </div>

</div>

<div class="row margin-bottom-1" ng-show="profileCtrl.nslProtologue" ng-cloak>
    <div class="col-md-12">
        <div class="citation zero-margin" data-ng-bind-html="profileCtrl.nslProtologue | sanitizeHtml"></div>
    </div>
</div>

<div class="row margin-bottom-1" ng-show="profileCtrl.profile.otherNames.length > 0" ng-cloak>
    <div class="col-md-12">
        <h4 class="zero-margin">{{profileCtrl.profile.otherNames.join(', ')}}</h4>
    </div>
</div>

<g:if test="${!profile.archivedDate}">
    <div class="top row margin-bottom-1">
        <g:render template="map" model="[allowStaticImage: true]"/>
        <div class="col-md-6 col-sm-12" ng-controller="ImagesController as imageCtrl" ng-init="imageCtrl.init('${edit}')">
            <g:render template="primaryImage"/>
        </div>
        <div class="col-md-6 col-sm-12" ng-if="profileCtrl.profile.primaryVideo">
            <div embed selected-multimedia="profileCtrl.primaryVideo"></div>
        </div>
        <div class="col-md-6 col-sm-12" ng-if="profileCtrl.profile.primaryAudio">
            <div embed selected-multimedia="profileCtrl.primaryAudio"></div>
        </div>
    </div>
</g:if>

<g:if test="${!profile.privateMode || (params.currentUser && params.isOpusReviewer)}">
    <div class="row">
        <div class="col-md-12" ng-cloak>
            <tabset ng-class="!profileCtrl.readonly() || (profileCtrl.opus.keybaseProjectId && profileCtrl.hasKeybaseKey) || (profileCtrl.profile.attachments.length > 0) ? '' : 'single-tabbed-panel'">
                <tab heading="Details" class="font-xxsmall" managed-tab>
                    <div class="row">
                        <div class="col-md-12">
                            <g:if test="${!profile.archivedDate}">
                                <g:include controller="profile" action="nomenclaturePanel"
                                           params="[opusId: params.opusId]"/>
                            </g:if>
                            <g:include controller="profile" action="attributesPanel"
                                       params="[opusId: params.opusId]"/>
                            <g:include controller="profile" action="linksPanel"
                                       params="[opusId: params.opusId]"/>
                            <g:include controller="profile" action="bhlLinksPanel"
                                       params="[opusId: params.opusId]"/>
                            <g:include controller="profile" action="specimenPanel"
                                       params="[opusId: params.opusId]"/>
                            <g:include controller="profile" action="classificationPanel"
                                       params="[opusId: params.opusId]"/>
                            <g:include controller="profile" action="bibliographyPanel"
                                       params="[opusId: params.opusId]"/>
                            <g:if test="${!profile.archivedDate}">
                                <g:include controller="profile" action="listsPanel"
                                           params="[opusId: params.opusId]"/>
                                <g:include controller="profile" action="taxonPanel"
                                           params="[opusId: params.opusId]"/>
                                <g:include controller="profile" action="imagesPanel"
                                           params="[opusId: params.opusId]"/>
                                <multimedia profile="profileCtrl.profile" readonly="profileCtrl.readonly"></multimedia>
                            </g:if>
                            <g:include controller="profile" action="publicationsPanel"
                                       params="[opusId: params.opusId]"/>
                            <g:if test="${params.isOpusReviewer}">
                                <g:include controller="profile" action="commentsPanel"
                                           params="[opusId: params.opusId]"/>
                            </g:if>
                        </div>
                    </div>
                </tab>
                <tab managed-tab heading="Key" class="font-xxsmall" select-to-initialise="true"
                     ng-show="profileCtrl.opus.keybaseProjectId && profileCtrl.hasKeybaseKey">
                    <div class="row" ng-if="profileCtrl.canInitialiseKeyplayer()">
                        <key-player taxon-name="profileCtrl.profile.scientificName" style="display: block"
                                    opus-id="profileCtrl.opus.uuid"
                                    only-include-items="profileCtrl.masterListKeybaseItems"
                                    keybase-url="${g.createLink(controller:'keybase', action:'keyLookup', absolute: true)}"
                                    key-lookup-url="${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/keybase/findKey"
                                    profile-url="${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}/profile"></key-player>
                    </div>
                </tab>
                <tab managed-tab heading="Documents" class="font-xxsmall"
                     ng-show="!profileCtrl.readonly() || profileCtrl.profile.attachments.length > 0">
                    <g:render template="/common/attachments" model="[hideHeading: true]"/>
                </tab>
            </tabset>
        </div>
    </div>
</g:if>

<g:render template="footer"></g:render>

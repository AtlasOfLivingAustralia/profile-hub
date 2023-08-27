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

<g:if test="${!profile.privateMode || (params.currentUser && params.isOpusReviewer)}">
    <div class="row">
        <div class="col-md-12" ng-cloak>
            <tabset>
                <tab heading="Profile" class="font-xxsmall" ng-show="managedTabCtrl.hasContent()" managed-tab>
                    <div class="row" ng-controller="ImagesController as imageCtrl" ng-init="imageCtrl.init('${edit}')">
                        <div ng-class="(profileCtrl.profile.mapSnapshot || imageCtrl.primaryImage || profileCtrl.primaryAudio || profileCtrl.primaryVideo) ? 'col-md-9' : 'col-md-12'">
                            <g:if test="${!profile.archivedDate}">
                                <g:render template="nomenclaturePanel"/>
                            </g:if>
                            <g:render template="specimens"/>
                            <g:render template="attributes"/>
                            <g:if test="${!profile.archivedDate}">
                                <g:render template="taxon"/>
                            </g:if>

                        </div>
                        <div class="side col-md-3" ng-if="profileCtrl.profile.mapSnapshot || imageCtrl.primaryImage || profileCtrl.primaryVideo || profileCtrl.primaryAudio">
                            <g:render template="mapSnapshot" model="[size: 'small']"/>
                            <g:render template="primaryImage" model="[size: 'small', hideViewAll:true]"/>
                            <div ng-if="profileCtrl.primaryVideo" embed selected-multimedia="profileCtrl.primaryVideo"></div>
                            <div ng-if="profileCtrl.primaryAudio" embed selected-multimedia="profileCtrl.primaryAudio"></div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">

                            <g:if test="${params.isOpusReviewer}">
                                <g:render template="comments"/>
                            </g:if>
                        </div>
                    </div>
                </tab>
                <tab heading="Distribution" class="font-xxsmall" managed-tab ng-show="managedTabCtrl.hasContent()">
                    <div class="row">
                        <div class="col-md-12 padding-bottom-2">
                            <g:render template="map" model="[allowStaticImage: false, width: '100%', height: '900px', fullWidth: true]"/>
                        </div>
                    </div>
                </tab>
                <tab heading="Gallery" class="font-xxsmall" managed-tab ng-show="managedTabCtrl.hasContent()">
                    <div class="row">
                        <div class="col-md-12">
                            <g:render template="images"/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <multimedia profile="profileCtrl.profile" readonly="profileCtrl.readonly"></multimedia>
                        </div>
                    </div>
                </tab>
                <tab heading="Literature & Links" class="font-xxsmall" managed-tab ng-show="managedTabCtrl.hasContent()">
                    <div class="row">
                        <div class="col-md-12">
                            <g:render template="/common/attachments" model="[hideHeading: false]"/>
                            <g:render template="links"/>
                            <g:render template="bhlLinks"/>
%{--                            <g:render template="publications"/>--}%
                            <g:render template="bibliography"/>
                            <g:if test="${!profile.archivedDate}">
                                <g:render template="lists"/>
                            </g:if>
                        </div>
                    </div>
                </tab>
                <tab heading="Key" class="font-xxsmall"
                     ng-show="profileCtrl.opus.keybaseProjectId && profileCtrl.hasKeybaseKey" managed-tab select-to-initialise="true">
                    <div class="row" ng-if="profileCtrl.canInitialiseKeyplayer()">
                        <key-player taxon-name="profileCtrl.profile.scientificName" style="display: block"
                                    opus-id="profileCtrl.opus.uuid"
                                    only-include-items="profileCtrl.masterListKeybaseItems"
                                    keybase-url="${g.createLink(controller:'keybase', action:'keyLookup', absolute: true)}"
                                    key-lookup-url="${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/keybase/findKey"
                                    profile-url="${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}/profile"></key-player>
                    </div>
                </tab>
            </tabset>
        </div>
    </div>
</g:if>

<g:render template="footer"></g:render>
